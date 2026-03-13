import math

def haversine(coord1, coord2):
    """Calculate the great circle distance between two points on the earth."""
    lat1, lon1 = coord1
    lat2, lon2 = coord2
    R = 6371.0  # Earth radius in kilometers

    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)

    a = (math.sin(dlat / 2.0) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2.0) ** 2)
    c = 2.0 * math.asin(math.sqrt(a))
    return R * c

def cosine_similarity(a, b):
    """Calculate the cosine similarity between two vectors."""
    length = max(len(a), len(b))
    dot = 0.0
    na = 0.0
    nb = 0.0
    for i in range(length):
        ai = a[i] if i < len(a) else 0.0
        bi = b[i] if i < len(b) else 0.0
        dot += ai * bi
        na += ai * ai
        nb += bi * bi
    denom = math.sqrt(na) * math.sqrt(nb) or 1.0
    return dot / denom
