def get_top_preferences(students_will_vector, k=3):

    items = []
    for key, val in students_will_vector.items():
        try:
            v = float(val)
        except (TypeError, ValueError):
            v = 0.0
        items.append((key, v))

    items.sort(key=lambda x: x[1], reverse=True)
    top = items[:k]

    pretty = {
        "Importance_Locality": "studying near your home",
        "Importance_Financial": "keeping fees within your budget",
        "Importance_Eligibility": "meeting eligibility and reservation criteria",
        "Importance_Events_hobbies": "matching your hobbies and extracurricular interests",
        "Importance_Quality": "overall college quality and facilities",
    }

    return [pretty.get(name, name) for name, _ in top]


def get_top_college_strengths(component_scores, k=3):
    
    labels = [
        "locality (distance and hostel facilities)",
        "financial fit (fees & scholarships)",
        "eligibility and seat availability",
        "events & hobbies alignment",
        "overall quality (placements, infra, facilities)",
    ]

    pairs = list(zip(labels, component_scores))
    pairs.sort(key=lambda x: x[1], reverse=True)
    return [label for label, _ in pairs[:k]]
