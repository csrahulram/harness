# Output service: reads config, builds the routes and serves them to their owner only.
import sys
from http.server import BaseHTTPRequestHandler
from http.server import HTTPServer
from pathlib import Path

ROOT = Path(__file__).parents[1]
sys.path.insert(0, str(ROOT))

from common.load_config import load_config
from common.read_json import read_json
from common.send_json import send_json
from memory import main as memory
from output.modules.make_routes import make_routes
from output.modules.serve_get import serve_get
from telemetry import main as telemetry
from users import main as users

CONFIG = load_config(ROOT)
SETTINGS = read_json(Path(__file__).parent / "config.json")
SERVICE = CONFIG["services"]["output"]
ROUTES = make_routes()

DEPS = {
    **SETTINGS,
    "origin": CONFIG["services"]["frontend"]["origin"],
    "pattern": CONFIG["names"]["pattern"],
    "folder": CONFIG["paths"]["output"],
    "input_folder": CONFIG["paths"]["input"],
    "media_types": CONFIG["media_types"],
    "telemetry": telemetry,
    "memory": memory,
    "users": users,
}


class Handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        send_json(self, 200, {}, DEPS["origin"])

    def do_GET(self):
        serve_get(self, ROUTES, DEPS)

    def log_message(self, *args):
        pass


if __name__ == "__main__":
    print("output listening on", SERVICE["bind"], SERVICE["port"], flush=True)
    try:
        HTTPServer((SERVICE["bind"], SERVICE["port"]), Handler).serve_forever()
    except KeyboardInterrupt:
        print("output stopped")
