"""
Guardrails Module for Chatbot Output Validation
Prevents hallucinations, enforces structured responses, and validates RAG grounding.
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, field_validator
import re

# ==============================================================================
# PYDANTIC MODELS FOR STRUCTURED RESPONSES
# ==============================================================================

class CollegeResponse(BaseModel):
    """Structured response for college-related queries."""
    college_name: str = Field(..., description="Name of the college")
    location: str = Field(..., description="District/city location")
    courses_offered: Optional[List[str]] = Field(default=None, description="List of courses")
    hostel_available: Optional[str] = Field(default="Unknown", description="Yes/No/Unknown")
    fees: Optional[str] = Field(default="Not specified", description="Fee information")
    
    @field_validator('college_name')
    @classmethod
    def validate_college_name(cls, v):
        if not v or len(v.strip()) < 3:
            raise ValueError("College name must be at least 3 characters")
        return v.strip()


class CourseResponse(BaseModel):
    """Structured response for course-related queries."""
    course_name: str = Field(..., description="Name of the course")
    stream: Optional[str] = Field(default=None, description="Arts/Science/Commerce")
    colleges_offering: Optional[List[str]] = Field(default=None, description="List of colleges")
    
    @field_validator('course_name')
    @classmethod
    def validate_course_name(cls, v):
        if not v or len(v.strip()) < 2:
            raise ValueError("Course name must be at least 2 characters")
        return v.strip()


class CareerResponse(BaseModel):
    """Structured response for career-related queries."""
    career_name: str = Field(..., description="Name of the career/profession")
    recommended_courses: List[str] = Field(..., description="Courses to pursue this career")
    skills_required: Optional[List[str]] = Field(default=None, description="Key skills")
    
    @field_validator('career_name')
    @classmethod
    def validate_career_name(cls, v):
        if not v or len(v.strip()) < 2:
            raise ValueError("Career name must be at least 2 characters")
        return v.strip()


class ChatbotResponse(BaseModel):
    """Main structured response from the chatbot."""
    answer: str = Field(..., description="The main answer text")
    confidence: float = Field(default=0.8, ge=0.0, le=1.0, description="Confidence score 0-1")
    is_grounded: bool = Field(default=True, description="Whether answer is based on provided context")
    sources_used: Optional[List[str]] = Field(default=None, description="Sources from context")
    response_type: str = Field(
        default="general",
        description="Type: college_info, course_info, career_advice, general"
    )
    
    @field_validator('answer')
    @classmethod
    def validate_answer(cls, v):
        if not v or len(v.strip()) < 10:
            raise ValueError("Answer must be at least 10 characters")
        return v.strip()
    
    @field_validator('response_type')
    @classmethod
    def validate_response_type(cls, v):
        allowed = ["college_info", "course_info", "career_advice", "general", "greeting", "redirect"]
        if v not in allowed:
            return "general"
        return v


# ==============================================================================
# RAG GROUNDING VALIDATORS
# ==============================================================================

class RAGGroundingValidator:
    """
    Validates that LLM responses are grounded in the provided context.
    Prevents hallucinations by checking if key claims exist in source data.
    """
    
    # Known J&K districts
    VALID_DISTRICTS = {
        "jammu", "srinagar", "anantnag", "baramulla", "pulwama", "budgam",
        "kupwara", "bandipora", "ganderbal", "shopian", "kulgam", "kathua",
        "udhampur", "doda", "ramban", "kishtwar", "rajouri", "poonch",
        "samba", "reasi"
    }
    
    # Known course prefixes
    VALID_COURSE_PREFIXES = {
        "bca", "bcom", "bba", "bsc", "ba", "bachelor", "master", "mba", "mca"
    }
    
    # Hallucination indicators
    HALLUCINATION_PATTERNS = [
        r"\b(MBBS|BTECH|B\.?Tech|Engineering degree|Medical degree|Law degree|LLB)\b",
        r"\bI think\b",
        r"\bprobably\b",
        r"\bmight be\b",
        r"\bI assume\b",
        r"\bI believe\b",
        r"\bgenerally speaking\b",
        r"\bin most cases\b",
    ]
    
    @classmethod
    def check_grounding(cls, response: str, context: str) -> Dict[str, Any]:
        """
        Check if the response is grounded in the provided context.
        Returns validation result with details.
        """
        issues = []
        warnings = []
        
        response_lower = response.lower()
        context_lower = context.lower()
        
        # 1. Check for hallucination patterns
        for pattern in cls.HALLUCINATION_PATTERNS:
            if re.search(pattern, response, re.IGNORECASE):
                # Check if it's actually in context
                if pattern.lower() not in context_lower:
                    issues.append(f"Potentially ungrounded claim detected: {pattern}")
        
        # 2. Check if mentioned colleges exist in context
        college_mentions = re.findall(r"(Government (?:Degree )?College[^,\.]+)", response, re.IGNORECASE)
        for college in college_mentions:
            if college.lower() not in context_lower:
                warnings.append(f"College '{college}' not found in context")
        
        # 3. Check if mentioned districts are valid
        for district in cls.VALID_DISTRICTS:
            if district in response_lower:
                # Valid district, no issue
                pass
        
        # 4. Check for made-up statistics
        percent_pattern = r"\d+(?:\.\d+)?%"
        percentages = re.findall(percent_pattern, response)
        for pct in percentages:
            if pct not in context:
                warnings.append(f"Statistic '{pct}' not found in context")
        
        # 5. Check for made-up fees
        fee_pattern = r"₹\s*[\d,]+|Rs\.?\s*[\d,]+"
        fees = re.findall(fee_pattern, response, re.IGNORECASE)
        for fee in fees:
            # Normalize and check
            fee_normalized = re.sub(r'[^\d]', '', fee)
            if fee_normalized and fee_normalized not in context.replace(',', ''):
                warnings.append(f"Fee amount '{fee}' not verified in context")
        
        is_grounded = len(issues) == 0
        confidence = 1.0 - (len(issues) * 0.2 + len(warnings) * 0.05)
        confidence = max(0.0, min(1.0, confidence))
        
        return {
            "is_grounded": is_grounded,
            "confidence": confidence,
            "issues": issues,
            "warnings": warnings
        }
    
    @classmethod
    def sanitize_response(cls, response: str, context: str) -> str:
        """
        Sanitize the response to remove potentially hallucinated content.
        Adds disclaimers where needed.
        """
        grounding = cls.check_grounding(response, context)
        
        if grounding["is_grounded"]:
            return response
        
        # Add disclaimer if there are issues
        disclaimer = "\n\n*Note: Please verify specific details directly with the college.*"
        
        if not response.endswith(disclaimer):
            response = response + disclaimer
        
        return response


# ==============================================================================
# INPUT VALIDATION (Pre-LLM)
# ==============================================================================

class InputValidator:
    """Validates and sanitizes user input before sending to LLM."""
    
    # Injection patterns to block
    INJECTION_PATTERNS = [
        r"ignore (?:previous|above|all) instructions",
        r"forget (?:everything|your instructions)",
        r"you are now",
        r"pretend you are",
        r"act as if",
        r"system prompt",
        r"<\s*script",
        r"\{\{.*\}\}",  # Template injection
    ]
    
    # Maximum input length
    MAX_INPUT_LENGTH = 1000
    
    @classmethod
    def validate(cls, user_input: str) -> Dict[str, Any]:
        """
        Validate user input for safety and appropriateness.
        Returns validation result.
        """
        if not user_input:
            return {"valid": False, "reason": "Empty input", "sanitized": ""}
        
        # Check length
        if len(user_input) > cls.MAX_INPUT_LENGTH:
            return {
                "valid": True,
                "reason": "Input truncated",
                "sanitized": user_input[:cls.MAX_INPUT_LENGTH]
            }
        
        # Check for injection attempts
        for pattern in cls.INJECTION_PATTERNS:
            if re.search(pattern, user_input, re.IGNORECASE):
                return {
                    "valid": False,
                    "reason": "Invalid input pattern detected",
                    "sanitized": ""
                }
        
        # Sanitize - remove excessive whitespace, normalize
        sanitized = " ".join(user_input.split())
        
        return {
            "valid": True,
            "reason": "OK",
            "sanitized": sanitized
        }


# ==============================================================================
# OUTPUT QUALITY VALIDATORS
# ==============================================================================

class OutputQualityValidator:
    """Validates the quality and appropriateness of chatbot outputs."""
    
    # Minimum response quality criteria
    MIN_RESPONSE_LENGTH = 50
    MAX_RESPONSE_LENGTH = 2000
    
    # Topics that should redirect to professionals
    SENSITIVE_TOPICS = [
        r"\b(suicide|self.harm|depression|anxiety|mental health crisis)\b",
        r"\b(illegal|drugs|violence)\b",
    ]
    
    @classmethod
    def validate_response(cls, response: str, context: str, question: str) -> Dict[str, Any]:
        """
        Comprehensive validation of chatbot response.
        """
        issues = []
        
        # 1. Check length
        if len(response) < cls.MIN_RESPONSE_LENGTH:
            issues.append("Response too short")
        if len(response) > cls.MAX_RESPONSE_LENGTH:
            issues.append("Response too long")
        
        # 2. Check for sensitive topics
        for pattern in cls.SENSITIVE_TOPICS:
            if re.search(pattern, response, re.IGNORECASE):
                issues.append("Contains sensitive topic - needs professional reference")
        
        # 3. Check relevance - response should relate to education/careers
        education_keywords = [
            "college", "course", "career", "study", "degree", "education",
            "university", "admission", "fee", "hostel", "stream"
        ]
        has_education_content = any(kw in response.lower() for kw in education_keywords)
        
        if not has_education_content and len(response) > 100:
            issues.append("Response may not be relevant to education/career")
        
        # 4. RAG grounding check
        grounding = RAGGroundingValidator.check_grounding(response, context)
        
        return {
            "valid": len(issues) == 0,
            "issues": issues,
            "grounding": grounding,
            "response_length": len(response)
        }


# ==============================================================================
# MAIN GUARDRAILS FUNCTION
# ==============================================================================

def apply_guardrails(
    response: str,
    context: str,
    question: str,
    validate_grounding: bool = True
) -> Dict[str, Any]:
    """
    Apply all guardrails to a chatbot response.
    
    Args:
        response: The LLM's response
        context: The RAG context used
        question: Original user question
        validate_grounding: Whether to validate RAG grounding
    
    Returns:
        Dict with validated/sanitized response and metadata
    """
    result = {
        "original_response": response,
        "final_response": response,
        "is_valid": True,
        "is_grounded": True,
        "confidence": 1.0,
        "issues": [],
        "warnings": [],
        "applied_fixes": []
    }
    
    # 1. Quality validation
    quality = OutputQualityValidator.validate_response(response, context, question)
    if not quality["valid"]:
        result["issues"].extend(quality["issues"])
    
    # 2. Grounding validation (if enabled)
    if validate_grounding and context:
        grounding = RAGGroundingValidator.check_grounding(response, context)
        result["is_grounded"] = grounding["is_grounded"]
        result["confidence"] = grounding["confidence"]
        result["issues"].extend(grounding["issues"])
        result["warnings"].extend(grounding["warnings"])
        
        # Apply sanitization if needed
        if not grounding["is_grounded"]:
            result["final_response"] = RAGGroundingValidator.sanitize_response(response, context)
            result["applied_fixes"].append("Added verification disclaimer")
    
    # 3. Determine overall validity
    result["is_valid"] = len(result["issues"]) == 0
    
    return result


def validate_input(user_input: str) -> Dict[str, Any]:
    """
    Validate user input before processing.
    Wrapper for InputValidator.
    """
    return InputValidator.validate(user_input)
