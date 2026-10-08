# Frontend service: serves the page and the few settings the browser needs, nothing else.
import sys
from functools import partial
from http.server import HTTPServer
from http.server import SimpleHTTPRequestHandler
from pathlib import Path

ROOT = Path(__file__).parents[1]
sys.path.insert(0, str(ROOT))

from common.load_config import load_config
from common.public_config import public_config
from common.send_json import send_json

FOLDER = Path(__file__).parent
CONFIG = load_config(ROOT)
SERVICE = CONFIG["services"]["frontend"]
PUBLIC = public_config(CONFIG)


class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.split("?")[0] == "/config.json":
            send_json(self, 200, PUBLIC, SERVICE["origin"])
            return
        super().do_GET()

    def list_directory(self, path):
        self.send_error(404)
        return None

    def log_message(self, *args):
        pass


if __name__ == "__main__":
    serve = partial(Handler, directory=str(FOLDER))
    print("frontend listening on", SERVICE["bind"], SERVICE["port"], flush=True)
    try:
        HTTPServer((SERVICE["bind"], SERVICE["port"]), serve).serve_forever()
    except KeyboardInterrupt:
        print("frontend stopped")
