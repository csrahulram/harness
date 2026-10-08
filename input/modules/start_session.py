# Makes sure the session exists for this person and names it after the first message.
def start_session(telemetry, session, owner, text, name_chars):
    telemetry.start(session, owner)
    telemetry.name_new(session, " ".join(text.split())[:name_chars])
