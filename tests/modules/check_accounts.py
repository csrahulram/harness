# Checks a bad password is refused and that one person cannot read another's session.
from tests.modules.fetch_json import fetch_json
from tests.modules.post_json import post_json
from tests.modules.sign_up import sign_up
from tests.modules.wait_result import wait_result


def check_accounts(input_url, output_url, timeout, pause):
    alice, token = sign_up(input_url)
    wrong = post_json(input_url, "/signin", {"user": alice, "password": "not-the-password"})[0]
    taken = post_json(input_url, "/signup", {"user": alice, "password": "a-good-password"})[0]
    sent = post_json(input_url, "/task", {"session": "acct_" + alice, "text": "Hello"}, token)[1]
    wait_result(output_url, "acct_" + alice, sent["task"], timeout, pause, token)
    _, other = sign_up(input_url)
    peek = fetch_json(output_url, "/history", other, session="acct_" + alice)
    mine = fetch_json(output_url, "/sessions", other)["sessions"]
    anonymous = fetch_json(output_url, "/sessions", None)
    passed = wrong == 401 and taken == 409 and peek.get("status") == 403 and not mine and anonymous.get("status") == 401
    detail = f"wrong={wrong} taken={taken} peek={peek.get('status')} anon={anonymous.get('status')}"
    return passed, "accounts", None, ["signup", "signin", "ownership"], detail
