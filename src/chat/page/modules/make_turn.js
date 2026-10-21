// Builds one turn in the thread, and hands back the few ways it is allowed to change later.
export function makeTurn(who, words, shot) {
  const turn = document.createElement("section");
  turn.className = `turn ${who === "You" ? "mine" : "theirs"}`;
  const name = document.createElement("p");
  name.className = "who";
  name.textContent = who;
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  if (shot) {
    const image = document.createElement("img");
    image.className = "shot";
    image.src = shot;
    image.alt = "the picture that was sent";
    bubble.append(image);
  }
  const text = document.createElement("span");
  text.textContent = words || (who === "You" ? "" : "working...");
  bubble.append(text);
  const trail = document.createElement("ul");
  trail.className = "trail";
  turn.append(name, trail, bubble);
  let missed = 0;
  return {
    turn,
    show(steps, follow) {
      trail.replaceChildren();
      if (missed) {
        trail.append(makeAside(missed));
      }
      for (const step of steps) {
        for (const said of step.said ?? []) {
          trail.append(makeSaid(said));
        }
      }
      if (follow) {
        turn.scrollIntoView({ block: "end", behavior: "smooth" });
      }
    },
    answered(reply) {
      text.textContent = reply;
    },
    forgot(many) {
      missed = many;
      trail.prepend(makeAside(many));
    },
    stopped(why) {
      turn.classList.add("stopped");
      text.textContent = why;
    },
  };
}

function makeSaid(said) {
  const line = document.createElement("li");
  const head = document.createElement("div");
  head.className = "head";
  head.textContent = `${said.agent} - ${said.model}  ${said.seconds}s`;
  const what = document.createElement("div");
  what.className = "what";
  what.textContent = said.text ? said.text : said.reason;
  line.append(head, what);
  return line;
}

function makeAside(many) {
  const line = document.createElement("li");
  line.className = "aside";
  line.textContent = `${many} earlier turn${many === 1 ? "" : "s"} did not fit and were left out`;
  return line;
}
