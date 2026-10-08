# Drops the token in use, leaving that person's other devices signed in.
def do_signout(token, deps):
    deps["users"].sign_out(token)
    return 200, {"signed_out": True}
