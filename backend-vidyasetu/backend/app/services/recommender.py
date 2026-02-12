import numpy as np 
import pandas as pd
from pathlib import Path
from app.utils.model1_utils import (
    compute_riasec,
    normalize_career_rows,
    get_recommendations,
    career_to_course,
    course_to_college
)

# Get the path to the asset directory
BASE_DIR = Path(__file__).resolve().parent.parent
ASSET_DIR = BASE_DIR / "asset"


def recommender1(Logical_reasoning,Quantitative_reasoning,Analytical_reasoning,Verbal_reasoning,Spatial_reasoning,Creativity,Enter):
    top = get_recommendations(
        csv_path=str(ASSET_DIR / "riasec_career_table.csv"),
        logical=Logical_reasoning,
        quant=Quantitative_reasoning,
        analytical=Analytical_reasoning,
        verbal=Verbal_reasoning,
        spatial=Spatial_reasoning,
        creativity=Creativity,
        enter=Enter
    )

    top_careers = top["Title"].tolist()
    return top_careers

