# Removes the signed in account; tokens, sessions and memories go with it.
import shutil


def do_delete(owner, deps):
    folder = deps["memory_folder"] / "users" / owner
    shutil.rmtree(folder, ignore_errors=True)
    deps["users"].delete(owner)
    return 200, {"deleted": owner}
