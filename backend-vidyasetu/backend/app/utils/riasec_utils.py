import numpy as np

def compute_riasec(logical, quant, analytical, verbal, spatial, creativity, enter):
    """
    Computes normalized RIASEC scores from aptitude assessment values.
    Returns a numpy array: [Realistic, Investigative, Artistic, Social, Enterprising, Conventional]
    """
    R = (0.055*logical + 0.022*quant + 0.044*analytical +
     0.011*verbal + 0.604*spatial + 0.033*creativity + 0.231*enter)

    I = (0.346*logical + 0.346*quant + 0.231*analytical +
     0.038*verbal + 0.015*spatial + 0.015*creativity + 0.008*enter)

    A = (0.019*logical + 0.009*quant + 0.094*analytical +
     0.094*verbal + 0.236*spatial + 0.481*creativity + 0.066*enter)

    S = (0.016*logical + 0.008*quant + 0.039*analytical +
     0.426*verbal + 0.023*spatial + 0.093*creativity + 0.395*enter)

    E = (0.042*logical + 0.025*quant + 0.042*analytical +
     0.212*verbal + 0.008*spatial + 0.068*creativity + 0.602*enter)

    C = (0.153*logical + 0.250*quant + 0.222*analytical +
     0.056*verbal + 0.194*spatial + 0.069*creativity + 0.056*enter)

    score_vec = np.array([R, I, A, S, E, C])
    
    # Avoid division by zero
    total = score_vec.sum()
    if total == 0:
        return score_vec
        
    return score_vec / total
