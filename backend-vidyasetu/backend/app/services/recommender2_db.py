# recommender2_db.py - College recommender using database
# Includes all scoring functions - some commented out until data is available in DB

import math
from app.utils.util_mod2_1 import embed, cosine_similarity, LOCALITY_COORDS


def haversine(coord1, coord2):
    """Calculate distance between two coordinates in km"""
    lat1, lon1 = coord1
    lat2, lon2 = coord2
    R = 6371.0

    dlat = (lat2 - lat1) * math.pi / 180.0
    dlon = (lon2 - lon1) * math.pi / 180.0

    a = (
        math.sin(dlat / 2.0) ** 2
        + math.cos(lat1 * math.pi / 180.0)
        * math.cos(lat2 * math.pi / 180.0)
        * math.sin(dlon / 2.0) ** 2
    )
    c = 2.0 * math.asin(math.sqrt(a))
    return R * c


def yes_no_score(val):
    """Convert yes/no values to 0/1 score"""
    if val is None:
        return 0
    s = str(val).strip().lower()
    if s in ["no", "none", "na", "n", "0", "false"]:
        return 0
    return 1


# ============================================================================
# LOCALITY MATCHING
# ============================================================================

def locality_match_score(student: dict, college: dict) -> float:
    """
    Calculate locality match based on district distance and hostel availability.
    """
    s_loc = (student.get("Student_Locality") or "").strip().lower()
    c_district = (college.get("District") or "").strip().lower()

    if not s_loc or not c_district:
        return 0.5
    
    if s_loc == c_district:
        return 1.0

    s_coord = LOCALITY_COORDS.get(s_loc, LOCALITY_COORDS.get("unknown", (33.0, 75.0)))
    c_coord = LOCALITY_COORDS.get(c_district, LOCALITY_COORDS.get("unknown", (33.0, 75.0)))

    dist = haversine(s_coord, c_coord)
    
    # Score decreases with distance (max 1000km = 0 score)
    score = max(0.0, 1.0 - dist / 1000.0)
    
    # -------------------------------------------------------------------------
    # TODO: Uncomment when hostel data is available in CollegeList table
    # Add column: "Hostel facility Yes / No" or "has_hostel" boolean
    # -------------------------------------------------------------------------
    # hostel_raw = (
    #     college.get("Hostel facility Yes / No")
    #     or college.get("has_hostel")
    #     or "No"
    # )
    # if yes_no_score(hostel_raw):
    #     score = min(1.0, score + 0.15)
    
    return round(float(score), 4)


# ============================================================================
# FINANCIAL MATCHING
# ============================================================================

def financial_match_score(student: dict, college: dict) -> float:
    """
    Calculate financial match based on fees and scholarships.
    
    TODO: Enable when these columns are added to CollegeList:
    - Fees Annual Rs in Lac General
    - Fees Annual Rs in Lac SC / ST
    - Fees Annual Rs in Lac OBC
    - Fees Annual Rs in Lac EWS
    - Fees Annual Rs in Lac Girls
    - Scholarship Annual Rs in Lac General
    - Scholarship Annual Rs in Lac SC / ST
    - etc.
    """
    # -------------------------------------------------------------------------
    # COMMENTED OUT - Enable when fee data is available in database
    # -------------------------------------------------------------------------
    
    # try:
    #     budget = float(student.get("Budget", 0))
    # except (TypeError, ValueError):
    #     budget = 0.0
    # 
    # if budget <= 0:
    #     return 0.5
    # 
    # cat = (student.get("Students_Category") or "").strip().lower()
    # 
    # fee_field_map = {
    #     "general": "Fees Annual Rs in Lac General",
    #     "sc": "Fees Annual Rs in Lac SC / ST",
    #     "st": "Fees Annual Rs in Lac SC / ST",
    #     "sc/st": "Fees Annual Rs in Lac SC / ST",
    #     "obc": "Fees Annual Rs in Lac OBC",
    #     "girls": "Fees Annual Rs in Lac Girls",
    #     "ews": "Fees Annual Rs in Lac EWS",
    # }
    # 
    # fee = None
    # if cat in fee_field_map and college.get(fee_field_map[cat]) is not None:
    #     try:
    #         fee = float(college.get(fee_field_map[cat]))
    #     except (TypeError, ValueError):
    #         fee = None
    # 
    # if fee is None or fee <= 0:
    #     try:
    #         fee = float(college.get("Fees Annual Rs in Lac General", 0))
    #     except (TypeError, ValueError):
    #         fee = None
    # 
    # if fee is None or fee <= 0:
    #     return 0.5
    # 
    # # Scholarship deduction
    # sch_field_map = {
    #     "general": "Scholarship Annual Rs in Lac General",
    #     "sc": "Scholarship Annual Rs in Lac SC / ST",
    #     "st": "Scholarship Annual Rs in Lac SC / ST",
    #     "sc/st": "Scholarship Annual Rs in Lac SC / ST",
    #     "obc": "Scholarship Annual Rs in Lac OBC",
    #     "girls": "Scholarship Annual Rs in Lac Girls",
    #     "ews": "Scholarship Annual Rs in Lac EWS",
    # }
    # 
    # scholarship = 0.0
    # if cat in sch_field_map and college.get(sch_field_map[cat]) is not None:
    #     try:
    #         scholarship = float(college.get(sch_field_map[cat]))
    #     except (TypeError, ValueError):
    #         scholarship = 0.0
    # 
    # if scholarship < 0:
    #     scholarship = 0.0
    # 
    # effective_fee = fee - scholarship
    # 
    # if effective_fee <= budget:
    #     return 1.0
    # 
    # ratio = effective_fee / budget
    # if ratio <= 1.2:
    #     return 0.85
    # if ratio <= 1.5:
    #     return 0.6
    # if ratio <= 1.9:
    #     return 0.35
    # return 0.1
    
    # Return neutral score until data is available
    return 0.5


# ============================================================================
# ELIGIBILITY MATCHING
# ============================================================================

def eligibility_match_score(student: dict, college: dict) -> float:
    """
    Calculate eligibility based on seats availability and gender.
    
    TODO: Enable seat-based matching when these columns are added:
    - No of Seats available General
    - No of Seats available SC / ST
    - No of Seats available OBC
    - No of Seats available EWS
    - No of Seats available Girls
    """
    gender = (student.get("Gender") or "").strip().lower()
    is_girls_college = college.get("For_girls", False)
    
    # Basic gender eligibility (available in current schema)
    if is_girls_college:
        if gender == "female":
            gender_score = 1.0
        else:
            return 0.0  # Male students cannot apply to girls-only college
    else:
        gender_score = 1.0
    
    # -------------------------------------------------------------------------
    # COMMENTED OUT - Enable when seat data is available in database
    # -------------------------------------------------------------------------
    
    # cat = (student.get("Students_Category") or "").strip().lower()
    # 
    # seat_field_map = {
    #     "general": "No of Seats available General",
    #     "sc": "No of Seats available SC / ST",
    #     "st": "No of Seats available SC / ST",
    #     "sc/st": "No of Seats available SC / ST",
    #     "obc": "No of Seats available OBC",
    #     "girls": "No of Seats available Girls",
    #     "ews": "No of Seats available EWS",
    # }
    # 
    # seat = None
    # if cat in seat_field_map and college.get(seat_field_map[cat]) is not None:
    #     try:
    #         seat = float(college.get(seat_field_map[cat]))
    #     except (TypeError, ValueError):
    #         seat = None
    # 
    # if seat is None or seat <= 0:
    #     try:
    #         seat = float(college.get("No of Seats available General", 0))
    #     except (TypeError, ValueError):
    #         seat = 0.0
    # 
    # category_score = 1.0 if seat > 0 else 0.4
    # 
    # try:
    #     girls_seats = float(college.get("No of Seats available Girls", 0) or 0)
    # except (TypeError, ValueError):
    #     girls_seats = 0.0
    # 
    # if gender == "female" and girls_seats > 0:
    #     gender_score = 1.0
    # elif gender == "male" and girls_seats > 0:
    #     gender_score = 0.9
    # 
    # score = 0.8 * category_score + 0.2 * gender_score
    # return round(float(score), 4)
    
    # Simplified scoring with available data
    return round(float(gender_score), 4)


# ============================================================================
# CULTURAL / EVENTS MATCHING
# ============================================================================

def get_student_hobbies_scores(student, category_emb):
    """Calculate student's hobby/interest scores by category"""
    extras = student.get("Extra_curriculars", []) or []
    hobbies = student.get("Hobbies", []) or []

    items = list(extras) + list(hobbies)
    if not items:
        return {cat: 0.25 for cat in category_emb.keys()}

    scores = {cat: 0.0 for cat in category_emb.keys()}

    for item in items:
        try:
            item_emb = embed(str(item))
        except:
            continue

        for cat, cat_emb in category_emb.items():
            sim = cosine_similarity(item_emb, cat_emb)
            scores[cat] += max(sim, 0.0)

    total = sum(scores.values())

    if total == 0:
        return {cat: 0.25 for cat in category_emb.keys()}

    return {cat: (val / total) for cat, val in scores.items()}


def get_college_hobbies_scores(college, category_text):
    """
    Get college's event/activity scores by category.
    
    TODO: Enable when these columns are added to CollegeList:
    - Cultural Events Yes / No
    - Sports Events Yes / No
    - Technical Events Yes / No
    - Others Events Yes / No
    """
    event_field_map = {
        "cultural": "Cultural Events Yes / No",
        "sport": "Sports Events Yes / No",
        "technical": "Technical Events Yes / No",
        "others": "Others  Events Yes / No", 
    }

    scores = {}
    for cat in category_text.keys():
        raw = None

        # Check for Fests_Flags if available
        fests_flags = college.get("Fests_Flags")
        if isinstance(fests_flags, dict) and cat in fests_flags and fests_flags[cat] is not None:
            raw = fests_flags[cat]
        else:
            fname = event_field_map.get(cat)
            if fname is not None and fname in college and college[fname] is not None:
                raw = college[fname]

        scores[cat] = yes_no_score(raw)

    return scores


def cultural_match_score(student: dict, college: dict, category_emb: dict, category_text: dict) -> float:
    """
    Calculate cultural/events match between student interests and college events.
    
    TODO: Enable when event data is available in database
    """
    # -------------------------------------------------------------------------
    # COMMENTED OUT - Enable when event data is available in database
    # -------------------------------------------------------------------------
    
    # s = get_student_hobbies_scores(student, category_emb)
    # c = get_college_hobbies_scores(college, category_text)
    # return cosine_similarity(list(s.values()), list(c.values()))
    
    # Return neutral score until data is available
    return 0.5


# ============================================================================
# QUALITY SCORING
# ============================================================================

def quality_score(college: dict) -> float:
    """
    Calculate college quality score based on placements, infrastructure, facilities.
    
    TODO: Enable full scoring when these columns are added:
    - Total Student ENROLLED FY 23 24
    - No of student placed through Campus FY 23 24
    - Average Placement PackageFY 23 24
    - Facilities offer by College Library Yes / No
    - Facilities offer by College Sports Facility Yes / No
    - Facilities offer by College Medical Facility Yes / No
    - Facilities offer by College Canteen Yes / No
    - Infrastructure (rating)
    """
    points = 0.0

    # -------------------------------------------------------------------------
    # COMMENTED OUT - Enable when placement data is available
    # -------------------------------------------------------------------------
    
    # try:
    #     placed = float(college.get("No of student placed through Campus FY 23 24", 0) or 0)
    #     enrolled = float(college.get("Total Student ENROLLED FY 23 24", 0) or 0)
    # except (TypeError, ValueError):
    #     placed = 0.0
    #     enrolled = 0.0
    # 
    # if placed > 0 and enrolled > 0:
    #     rate = min(placed / enrolled, 1.0)
    #     points += rate * 4.0  # Weight: 4
    # 
    # try:
    #     pkg = float(college.get("Average Placement PackageFY 23 24", 0) or 0)
    # except (TypeError, ValueError):
    #     pkg = 0.0
    # 
    # if pkg > 0:
    #     points += min(pkg / 1200000.0, 1.0) * 3.0  # Weight: 3
    # 
    # try:
    #     infra = float(college.get("Infrastructure", 5) or 5)
    # except (TypeError, ValueError):
    #     infra = 5.0
    # 
    # points += min(infra / 10.0, 1.0) * 2.0  # Weight: 2
    # 
    # # Facilities scoring
    # fac_list = [
    #     "Facilities offer by College Library Yes / No",
    #     "Facilities offer by College Sports Facility Yes / No",
    #     "Facilities offer by College Medical Facility Yes / No",
    #     "Facilities offer by College Canteen Yes / No",
    # ]
    # f = 0
    # for k in fac_list:
    #     f += yes_no_score(college.get(k))
    # 
    # points += min(f / 4.0, 1.0) * 1.0  # Weight: 1
    # 
    # return round(points / 10.0, 4)
    
    # -------------------------------------------------------------------------
    # BASIC QUALITY SCORING with available data
    # -------------------------------------------------------------------------
    
    score = 0.5  # Base score
    
    # Older colleges might have more established programs
    year = college.get("Year Of Establishment")
    if year:
        try:
            age = 2024 - int(year)
            if age > 50:
                score += 0.2
            elif age > 20:
                score += 0.15
            elif age > 10:
                score += 0.1
        except (ValueError, TypeError):
            pass
    
    # Having a university affiliation is positive
    if college.get("University Name"):
        score += 0.1
    
    # Having a website suggests better infrastructure
    if college.get("Website"):
        score += 0.05
    
    # Government colleges often have better resources
    management = (college.get("Management") or "").strip().lower()
    if "government" in management or "govt" in management:
        score += 0.1
    
    return round(min(float(score), 1.0), 4)


# ============================================================================
# FINAL SCORING
# ============================================================================

def normalize_student_will_vector(preferences: dict) -> dict:
    """Normalize student preferences to weights that sum to 1"""
    weights = {
        "locality": preferences.get("Importance_Locality", 3),
        "financial": preferences.get("Importance_Financial", 3),
        "eligibility": preferences.get("Importance_Eligibility", 3),
        "cultural": preferences.get("Importance_Events_hobbies", 3),
        "quality": preferences.get("Importance_Quality", 3),
    }
    
    total = sum(weights.values())
    if total == 0:
        return {k: 0.2 for k in weights}
    
    return {k: v / total for k, v in weights.items()}


def college_recommender_db(
    student_actual_vector: dict,
    students_will_vector: dict,
    colleges: list,
    final_college_list: list
) -> tuple:
    """
    College recommender using database data.
    
    Args:
        student_actual_vector: Student's actual profile (locality, gender, etc.)
        students_will_vector: Student's preferences (weights for different factors)
        colleges: List of college dicts from database
        final_college_list: List of college names to filter by (from course→college mapping)
    
    Returns:
        (college_match_score, final_scores) - Two dicts with scores per college
    """
    # Category embeddings for cultural matching (kept for future use)
    CATEGORY_TEXT = {
        "cultural": ["music", "dance", "art", "painting", "theatre", "singing"],
        "sport": ["football", "cricket", "running", "basketball"],
        "technical": ["coding", "programming", "robotics", "ai"],
        "others": ["charity", "volunteering", "socialwork"],
    }

    CATEGORY_EMB = {}
    for cat, words in CATEGORY_TEXT.items():
        phrase = " ".join(words)
        CATEGORY_EMB[cat] = embed(phrase)
    
    college_match_score = {}
    
    # Create a lowercase set for case-insensitive matching
    final_college_list_lower = set()
    if final_college_list:
        final_college_list_lower = {c.lower().strip() for c in final_college_list}
    
    matched_count = 0
    skipped_count = 0
    
    for college in colleges:
        name = college.get("Name", "").strip()
        
        if not name:
            continue
        
        # Filter by final college list (case-insensitive)
        if final_college_list_lower and name.lower() not in final_college_list_lower:
            skipped_count += 1
            continue
        
        matched_count += 1
        
        # Calculate individual scores
        locality_score = locality_match_score(student_actual_vector, college)
        finance_score = financial_match_score(student_actual_vector, college)
        eligibility_score = eligibility_match_score(student_actual_vector, college)
        cultural_score = cultural_match_score(
            student_actual_vector, college, CATEGORY_EMB, CATEGORY_TEXT
        )
        quality = quality_score(college)
        
        # Skip colleges where eligibility is 0 (e.g., male applying to girls college)
        if eligibility_score == 0:
            continue
        
        # Store component scores
        # [locality, finance, eligibility, cultural, quality]
        college_match_score[name] = [
            locality_score,
            finance_score,
            eligibility_score,
            cultural_score,
            quality,
        ]
    
    print(f"   → College filter: {matched_count} matched, {skipped_count} skipped")
    
    if not college_match_score:
        print("   ⚠️ No colleges matched filter! Falling back to scoring all colleges...")
        # Fallback: Score ALL colleges if none matched the filter
        for college in colleges:
            name = college.get("Name", "").strip()
            if not name:
                continue
            
            locality_score = locality_match_score(student_actual_vector, college)
            finance_score = financial_match_score(student_actual_vector, college)
            eligibility_score = eligibility_match_score(student_actual_vector, college)
            cultural_score = cultural_match_score(
                student_actual_vector, college, CATEGORY_EMB, CATEGORY_TEXT
            )
            quality = quality_score(college)
            
            if eligibility_score == 0:
                continue
            
            college_match_score[name] = [
                locality_score,
                finance_score,
                eligibility_score,
                cultural_score,
                quality,
            ]
        
        print(f"   → Fallback: Scored {len(college_match_score)} colleges")
        
        if not college_match_score:
            print("   ❌ Still no colleges after fallback!")
            return {}, {}
    
    # Normalize student preferences
    weights_dict = normalize_student_will_vector(students_will_vector)
    weights = [
        weights_dict["locality"],
        weights_dict["financial"],
        weights_dict["eligibility"],
        weights_dict["cultural"],
        weights_dict["quality"],
    ]
    
    # Calculate final scores
    final_scores = {}
    for college_name, scores in college_match_score.items():
        final_score = sum(s * w for s, w in zip(scores, weights))
        final_scores[college_name] = round(float(final_score), 4)
    
    return college_match_score, final_scores
