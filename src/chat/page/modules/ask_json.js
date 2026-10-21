// Asks the harness for something and insists on a real answer, so a wrong route cannot look like data.
export async function askJson(where, how) {
  const answer = await fetch(where, how);
  const kind = answer.headers.get("content-type") ?? "";
  if (!kind.includes("application/json")) {
    throw new Error(`the harness has no ${where.split("?")[0]} - is it running the latest code?`);
  }
  const said = await answer.json();
  if (!answer.ok) {
    throw new Error(said.error ?? `the harness refused that (${answer.status})`);
  }
  return said;
}
