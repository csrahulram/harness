// Puts the candidates in order and drops anything the ledger or the no-touch list rules out.
import type { Candidate } from "./make_candidates.ts";
import type { Noted } from "./read_ledger.ts";

export function rankCandidates(
  made: Candidate[],
  known: Map<string, Noted>,
  rules: { never: string[]; gives_up_after: number },
): Candidate[] {
  return made
    .filter((one) => {
      const noted = known.get(one.id);
      if (noted?.verdict === "retired" || noted?.verdict === "pending") {
        return false;
      }
      if ((noted?.tries ?? 0) >= rules.gives_up_after && noted?.verdict !== "improved") {
        return false;
      }
      return one.kind === "report" || !rules.never.some((path) => one.file.startsWith(path));
    })
    .sort((one, two) => two.score - one.score);
}
