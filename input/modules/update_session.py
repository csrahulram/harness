# Applies a session request: close it, rename it, or just mark it used.
def update_session(telemetry, request, owner):
    session = request["session"]
    telemetry.start(session, owner)
    if request["close"]:
        telemetry.close(session)
        return {"session": session, "closed": True}
    if request["name"]:
        telemetry.rename(session, request["name"])
    return {"session": session, "name": request["name"]}
