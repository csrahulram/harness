// Judges from the boxes alone whether one whole subject sits big enough and square enough to use.
export function measureSubject(
  facts: { [name: string]: string | number | boolean } | undefined,
  limits: { least_coverage: number; most_coverage: number; most_offset: number },
): { [name: string]: string | number } {
  const labels = String(facts?.labels ?? "")
    .split(", ")
    .filter(Boolean);
  const boxes = JSON.parse(String(facts?.boxes ?? "[]")) as number[][];
  const width = Number(facts?.width ?? 0);
  const height = Number(facts?.height ?? 0);
  if (labels.length === 0 || boxes.length === 0 || !width || !height) {
    return { subject: "nothing the model could name", usable: "no: nothing was found in it" };
  }
  const area = (b: number[]) => Math.abs((b[2]! - b[0]!) * (b[3]! - b[1]!));
  let best = 0;
  for (let at = 1; at < boxes.length; at += 1) {
    if (area(boxes[at]!) > area(boxes[best]!)) {
      best = at;
    }
  }
  const box = boxes[best]!;
  const coverage = Number((area(box) / (width * height)).toFixed(3));
  const offRight = Math.abs((box[0]! + box[2]!) / 2 - width / 2) / (width / 2);
  const offDown = Math.abs((box[1]! + box[3]!) / 2 - height / 2) / (height / 2);
  const offset = Number(Math.max(offRight, offDown).toFixed(3));
  const tooSmall = coverage < limits.least_coverage;
  const tooBig = coverage > limits.most_coverage;
  const offCentre = offset > limits.most_offset;
  const usable = tooSmall
    ? `no: the subject fills only ${coverage} of the frame`
    : tooBig
      ? `no: the subject is cut off, filling ${coverage} of the frame`
      : offCentre
        ? `no: the subject sits ${offset} away from the middle`
        : "yes";
  return { subject: labels[best] ?? labels[0]!, things: labels.length, coverage, offset, usable };
}
