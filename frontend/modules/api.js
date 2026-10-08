export function makeApi(config, token) {
  const inputUrl = config.urls.input;
  const outputUrl = config.urls.output;

  async function readJson(response) {
    const body = await response.json();
    if (!response.ok) {
      throw new Error(body.error || "request failed");
    }
    return body;
  }

  function headers(extra) {
    return { ...extra, "X-Token": token() };
  }

  async function post(route, payload) {
    const response = await fetch(inputUrl + route, {
      method: "POST",
      headers: headers({ "Content-Type": "application/json" }),
      body: JSON.stringify(payload),
    });
    return readJson(response);
  }

  async function get(route, query) {
    const params = new URLSearchParams(query);
    return readJson(await fetch(outputUrl + route + "?" + params, { headers: headers({}) }));
  }

  return {
    account: (route, body) => post(route, body),
    signOut: () => post("/signout", {}),
    deleteAccount: () => post("/account", { delete: true }),
    sendTask: (session, text) => post("/task", { session, text }),
    renameSession: (session, name) => post("/session", { session, name }),
    closeSession: (session) => post("/session", { session, close: true }),
    fetchResult: (session, task) => get("/result", { session, task }),
    fetchStream: (session, task) => get("/stream", { session, task }),
    fetchHistory: (session) => get("/history", { session }).then((body) => body.chain),
    fetchSessions: () => get("/sessions", {}).then((body) => body.sessions),
    readNotes: () => get("/memory", {}),
    saveNotes: (notes) => post("/memory", notes),
    readFacts: () => get("/facts", {}),
    forget: (id) => post("/forget", { id }),
  };
}
