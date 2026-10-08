# The GET routes: the query values each needs, whether it belongs to a session, and what runs it.
from output.modules.get_file import get_file
from output.modules.get_facts import get_facts
from output.modules.get_history import get_history
from output.modules.get_memory import get_memory
from output.modules.get_result import get_result
from output.modules.get_sessions import get_sessions
from output.modules.get_stream import get_stream


def make_routes():
    return {
        "/result": (["session", "task"], True, get_result),
        "/stream": (["session", "task"], True, get_stream),
        "/history": (["session"], True, get_history),
        "/file": (["session"], True, get_file),
        "/sessions": ([], False, get_sessions),
        "/memory": ([], False, get_memory),
        "/facts": ([], False, get_facts),
    }
