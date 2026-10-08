# Raises if a dict is missing any key of the named shape; the contract check at boundaries.
def check_shape(record, shape, name):
    if not isinstance(record, dict):
        raise ValueError(f"{name} is not a dict")
    missing = [key for key in shape if key not in record]
    if missing:
        raise ValueError(f"{name} is missing {missing}")
    return record
