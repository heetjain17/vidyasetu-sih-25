import math

from .util_mod2_1 import (
    embed,
    cosine_similarity,
    normalize_student_will_vector,
    college_to_vector,
    student_will_to_vector,
    LOCALITY_COORDS,
)


def haversine(coord1, coord2):
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
    if val is None:
        return 0
    s = str(val).strip().lower()
    if s in ["no", "none", "na", "n", "0", "false"]:
        return 0
    return 1


def get_student_hobbies_scores(student, category_emb):
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
    event_field_map = {
        "cultural": "Cultural Events Yes / No",
        "sport": "Sports Events Yes / No",
        "technical": "Technical Events Yes / No",
        "others": "Others  Events Yes / No", 
    }

    scores = {}
    for cat in category_text.keys():
        raw = None

        fests_flags = college.get("Fests_Flags")
        if isinstance(fests_flags, dict) and cat in fests_flags and fests_flags[cat] is not None:
            raw = fests_flags[cat]
        else:
            fname = event_field_map.get(cat)
            if fname is not None and fname in college and college[fname] is not None:
                raw = college[fname]

        scores[cat] = yes_no_score(raw)

    return scores


def cultural_match_score(student, college, category_emb, category_text):
    s = get_student_hobbies_scores(student, category_emb)
    c = get_college_hobbies_scores(college, category_text)
    return cosine_similarity(list(s.values()), list(c.values()))


def financial_match_score(student, college):
    try:
        budget = float(student.get("Budget", 0))
    except (TypeError, ValueError):
        budget = 0.0

    if budget <= 0:
        return 0.5

    cat = (student.get("Students_Category") or "").strip().lower()

    fee_field_map = {
        "general": "Fees Annual Rs in Lac General",
        "sc": "Fees Annual Rs in Lac SC / ST",
        "st": "Fees Annual Rs in Lac SC / ST",
        "sc/st": "Fees Annual Rs in Lac SC / ST",
        "obc": "Fees Annual Rs in Lac OBC",
        "girls": "Fees Annual Rs in Lac Girls",
        "ews": "Fees Annual Rs in Lac EWS",
    }

    fee = None
    if cat in fee_field_map and college.get(fee_field_map[cat]) is not None:
        try:
            fee = float(college.get(fee_field_map[cat]))
        except (TypeError, ValueError):
            fee = None

    if fee is None or fee <= 0:
        try:
            fee = float(college.get("Fees Annual Rs in Lac General", 0))
        except (TypeError, ValueError):
            fee = None

    if fee is None or fee <= 0:
        return 0.5

 
    sch_field_map = {
        "general": "Scholarship Annual Rs in Lac General",
        "sc": "Scholarship Annual Rs in Lac SC / ST",
        "st": "Scholarship Annual Rs in Lac SC / ST",
        "sc/st": "Scholarship Annual Rs in Lac SC / ST",
        "obc": "Scholarship Annual Rs in Lac OBC",
        "girls": "Scholarship Annual Rs in Lac Girls",
        "ews": "Scholarship Annual Rs in Lac EWS",
    }

    scholarship = 0.0
    if cat in sch_field_map and college.get(sch_field_map[cat]) is not None:
        try:
            scholarship = float(college.get(sch_field_map[cat]))
        except (TypeError, ValueError):
            scholarship = 0.0

    if scholarship < 0:
        scholarship = 0.0

    effective_fee = fee - scholarship

    if effective_fee <= budget:
        return 1.0

    ratio = effective_fee / budget
    if ratio <= 1.2:
        return 0.85
    if ratio <= 1.5:
        return 0.6
    if ratio <= 1.9:
        return 0.35
    return 0.1



def locality_match_score(student, college):
    s_loc = (student.get("Student_Locality") or "").strip().lower()
    c_district = (college.get("District") or "").strip().lower()

    if not s_loc or not c_district:
        return 0.5
    if s_loc == c_district:
        return 1.0

    s_coord = LOCALITY_COORDS.get(s_loc, LOCALITY_COORDS["unknown"])
    c_coord = LOCALITY_COORDS.get(c_district, LOCALITY_COORDS["unknown"])

    dist = haversine(s_coord, c_coord)

    score = max(0.0, 1.0 - dist / 1000.0)

    hostel_raw = (
        college.get("Hostel facility Yes / No")
        or college.get("Hostel")
        or "No"
    )
    if yes_no_score(hostel_raw):
        score = min(1.0, score + 0.15)

    return round(float(score), 4)


def eligibility_match_score(student, college):
    cat = (student.get("Students_Category") or "").strip().lower()
    gender = (student.get("Gender") or "").strip().lower()

    seat_field_map = {
        "general": "No of Seats available General",
        "sc": "No of Seats available SC / ST",
        "st": "No of Seats available SC / ST",
        "sc/st": "No of Seats available SC / ST",
        "obc": "No of Seats available OBC",
        "girls": "No of Seats available Girls",
        "ews": "No of Seats available EWS",
    }

    seat = None
    if cat in seat_field_map and college.get(seat_field_map[cat]) is not None:
        try:
            seat = float(college.get(seat_field_map[cat]))
        except (TypeError, ValueError):
            seat = None

    if seat is None or seat <= 0:
        try:
            seat = float(college.get("No of Seats available General", 0))
        except (TypeError, ValueError):
            seat = 0.0

    category_score = 1.0 if seat > 0 else 0.4

    try:
        girls_seats = float(college.get("No of Seats available Girls", 0) or 0)
    except (TypeError, ValueError):
        girls_seats = 0.0

    gender_score = 1.0
    if gender == "female" and girls_seats > 0:
        gender_score = 1.0
    elif gender == "male" and girls_seats > 0:
        gender_score = 0.9

    score = 0.8 * category_score + 0.2 * gender_score
    return round(float(score), 4)


def quality_score(college):
    points = 0.0

    try:
        placed = float(college.get("No of student placed through Campus FY 23 24", 0) or 0)
        enrolled = float(college.get("Total Student ENROLLED FY 23 24", 0) or 0)
    except (TypeError, ValueError):
        placed = 0.0
        enrolled = 0.0

    if placed > 0 and enrolled > 0:
        rate = min(placed / enrolled, 1.0)
        points += rate * 4.0 

    try:
        pkg = float(college.get("Average Placement PackageFY 23 24", 0) or 0)
    except (TypeError, ValueError):
        pkg = 0.0

    if pkg > 0:
        points += min(pkg / 1200000.0, 1.0) * 3.0 

    try:
        infra = float(college.get("Infrastructure", 5) or 5)
    except (TypeError, ValueError):
        infra = 5.0

    points += min(infra / 10.0, 1.0) * 2.0 

    fac_list = [
        "Facilities offer by College Library Yes / No",
        "Facilities offer by College Sports Facility Yes / No",
        "Facilities offer by College Medical Facility Yes / No",
        "Facilities offer by College Canteen Yes / No",
    ]
    f = 0
    for k in fac_list:
        f += yes_no_score(college.get(k))

    points += min(f / 4.0, 1.0) * 1.0 

    return round(points / 10.0, 4) 


def final_college_match_score(student_will_norm: dict, college_score_list):
    student_vec = student_will_to_vector(student_will_norm)
    college_vec = college_to_vector(college_score_list)
    return cosine_similarity(student_vec, college_vec)
