# Current UTC time as an ISO string.
from datetime import datetime
from datetime import timezone


def now():
    return datetime.now(timezone.utc).isoformat(timespec="seconds")
