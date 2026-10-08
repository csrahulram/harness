# Makes a short random task id.
import uuid


def new_task_id():
    return uuid.uuid4().hex[:12]
