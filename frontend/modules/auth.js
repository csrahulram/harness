export function makeAuth(api, screen, form, message, store) {
  function token() {
    return localStorage.getItem(store.token) || "";
  }

  function user() {
    return localStorage.getItem(store.user) || "";
  }

  function keep(reply) {
    localStorage.setItem(store.token, reply.token);
    localStorage.setItem(store.user, reply.user);
  }

  function forget() {
    localStorage.removeItem(store.token);
    localStorage.removeItem(store.user);
  }

  function show(on) {
    screen.hidden = !on;
    document.body.classList.toggle("signed-out", on);
  }

  async function submit(route) {
    const name = form.user.value.trim();
    const password = form.password.value;
    message.textContent = "";
    try {
      keep(await api.account(route, { user: name, password }));
      show(false);
      return true;
    } catch (error) {
      message.textContent = error.message;
      return false;
    }
  }

  return { token, user, forget, show, submit };
}
