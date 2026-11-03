// Applies one stack command and returns the new stack state
const stack: Record<string, string> = {};

async function HandleCommand(command: { action: string; model: string }) {

    if (command.action === "load") stack[command.model] = "loaded";
    if (command.action === "unload") delete stack[command.model];

    return { type: "stack", stack };
}

export default HandleCommand;
