A = 1.75
B = 0.00698


def price_model(lp: float) -> float:
    return ((lp ** A) * B) + 10
