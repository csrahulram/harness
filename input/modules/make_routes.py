# The POST routes: whether each needs someone signed in, and what runs it.
from input.modules.do_delete import do_delete
from input.modules.do_forget import do_forget
from input.modules.do_memory import do_memory
from input.modules.do_session import do_session
from input.modules.do_signin import do_signin
from input.modules.do_signout import do_signout
from input.modules.do_signup import do_signup
from input.modules.do_task import do_task
from input.modules.do_upload import do_upload


def make_routes():
    return {
        "/signup": (False, lambda raw, started, owner, deps: do_signup(raw, deps)),
        "/signin": (False, lambda raw, started, owner, deps: do_signin(raw, deps)),
        "/signout": (False, lambda raw, started, owner, deps: do_signout(deps["token"], deps)),
        "/task": (True, lambda raw, started, owner, deps: do_task(raw, started, deps, owner)),
        "/session": (True, lambda raw, started, owner, deps: do_session(raw, deps, owner)),
        "/upload": (True, lambda raw, started, owner, deps: do_upload(raw, deps, owner)),
        "/account": (True, lambda raw, started, owner, deps: do_delete(owner, deps)),
        "/memory": (True, lambda raw, started, owner, deps: do_memory(raw, deps, owner)),
        "/forget": (True, lambda raw, started, owner, deps: do_forget(raw, deps, owner)),
    }
