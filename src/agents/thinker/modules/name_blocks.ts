// Names each piece of what was sent to the model, so the context can be read back block by block.
import type { Block } from "../../../common/make_step.ts";

export function nameBlocks(
  said: { role: string; content: string }[],
  names: { system: string; them: string; me: string; asked: string },
): Block[] {
  const turns = said.length - 2;
  return said.map((one, at) => {
    const first = at === 0;
    const last = at === said.length - 1;
    const name = first
      ? names.system
      : last
        ? names.asked
        : `${one.role === "user" ? names.them : names.me} ${Math.ceil((at + 1) / 2)} of ${Math.ceil(turns / 2)}`;
    return { name, role: one.role, chars: one.content.length, text: one.content };
  });
}
