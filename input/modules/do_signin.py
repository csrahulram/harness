# Checks a password and hands back a token.
from input.modules.parse_login import parse_login


def do_signin(raw, deps):
    login = parse_login(raw, deps["pattern"], deps["least_password"])
    if login is None:
        return 400, {"error": deps["bad_login"]}
    token = deps["users"].sign_in(login["user"], login["password"])
    if token is None:
        return 401, {"error": deps["bad_credentials"]}
    return 200, {"user": login["user"], "token": token}
