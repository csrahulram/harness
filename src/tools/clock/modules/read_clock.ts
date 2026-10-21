// Reads this computer's clock, in whatever place the words named, or where the computer sits.
export function readClock(
  words: string,
  zones: { [name: string]: string },
  now: Date,
): { where: string; zone: string; told: string } {
  const said = words.toLowerCase();
  let where = "";
  let zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  for (const [name, named] of Object.entries(zones)) {
    if (said.includes(name) && name.length > where.length) {
      where = name;
      zone = named;
    }
  }
  const told = new Intl.DateTimeFormat("en-GB", {
    timeZone: zone,
    dateStyle: "full",
    timeStyle: "short",
  }).format(now);
  return { where: where || zone, zone, told };
}
