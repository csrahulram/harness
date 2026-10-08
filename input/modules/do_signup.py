# Creates an account and hands back a token, or says the name is taken.
from input.modules.parse_login import parse_login


def do_signup(raw, deps):
    login = parse_login(raw, deps["pattern"], deps["least_password"])
    if login is None:
        return 400, {"error": deps["bad_login"]}
    token = deps["users"].sign_up(login["user"], login["password"])
    if token is None:
        return 409, {"error": deps["name_taken"]}
    return 200, {"user": login["user"], "token": token}
