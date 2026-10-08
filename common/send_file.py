# Sends a file as an HTTP response with its media type and the frontend CORS header.
def send_file(handler, path, media_type, origin):
    body = path.read_bytes()
    handler.send_response(200)
    handler.send_header("Content-Type", media_type)
    handler.send_header("Content-Length", str(len(body)))
    handler.send_header("Access-Control-Allow-Origin", origin)
    handler.end_headers()
    handler.wfile.write(body)
