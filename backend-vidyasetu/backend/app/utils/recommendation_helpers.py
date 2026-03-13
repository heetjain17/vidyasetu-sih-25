def career_to_course(career_list, career_course_dict):
    """
    Maps a list of careers to their recommended courses.
    career_list: list of strings
    career_course_dict: {career_name: [course_names]}
    """
    result = []
    for career in career_list:
        courses = career_course_dict.get(career, [])
        if courses:
            result.append({"career": career, "courses": courses})
    return result

def course_to_college(career_course_list, course_college_dict):
    """
    Maps recommended courses to providing colleges.
    career_course_list: list of {"career": str, "courses": [str]}
    course_college_dict: {course_name: [college_names]}
    """
    detailed_mapping = []
    unique_colleges = set()

    for entry in career_course_list:
        for course in entry["courses"]:
            colleges = course_college_dict.get(course, [])
            if colleges:
                detailed_mapping.append({"course": course, "colleges": colleges})
                for col in colleges:
                    unique_colleges.add(col)

    return detailed_mapping, sorted(list(unique_colleges))
