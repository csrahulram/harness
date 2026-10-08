# Input service: reads config, builds the routes and serves them.
import sys
from http.server import BaseHTTPRequestHandler
from http.server import HTTPServer
from pathlib import Path

ROOT = Path(__file__).parents[1]
sys.path.insert(0, str(ROOT))

from common.load_config import load_config
from common.read_json import read_json
from common.send_json import send_json
from input.modules.make_deps import make_deps
from input.modules.make_routes import make_routes
from input.modules.serve_post import serve_post
from telemetry import main as telemetry
from users import main as users

CONFIG = load_config(ROOT)
SETTINGS = read_json(Path(__file__).parent / "config.json")
SERVICE = CONFIG["services"]["input"]
ROUTES = make_routes()
DEPS = make_deps(CONFIG, SETTINGS, telemetry, users)


class Handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        send_json(self, 200, {}, DEPS["origin"])

    def do_POST(self):
        serve_post(self, ROUTES, DEPS)

    def log_message(self, *args):
        pass


if __name__ == "__main__":
    print("input listening on", SERVICE["bind"], SERVICE["port"], flush=True)
    try:
        HTTPServer((SERVICE["bind"], SERVICE["port"]), Handler).serve_forever()
    except KeyboardInterrupt:
        print("input stopped")
