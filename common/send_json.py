# Sends a JSON HTTP response with the CORS headers for the frontend origin.
import json


def send_json(handler, status, record, origin):
    body = json.dumps(record).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json")
    handler.send_header("Access-Control-Allow-Origin", origin)
    handler.send_header("Access-Control-Allow-Headers", "Content-Type, X-Token")
    handler.end_headers()
    handler.wfile.write(body)
