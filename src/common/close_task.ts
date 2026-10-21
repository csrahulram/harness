// Writes the last step when work stops early, so the chain shows a refusal as plainly as a success.
import { makeStep, type Said, type Step } from "./make_step.ts";
import { writeStep } from "./write_step.ts";

export function closeTask(
  scratchpad: string,
  step: Step,
  who: string,
  why: string,
  said: Said[] = [],
): void {
  writeStep(
    scratchpad,
    makeStep(
      {
        task: step.task,
        step: step.step + 1,
        about: step.about,
        next: who,
        from: who,
        note: why,
      },
      { done: true, facts: { ...step.facts, stopped: why }, said },
    ),
  );
}
