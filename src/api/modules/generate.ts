// Handles the generate route
import type { Request, Response } from "express";
import workflow from "../../workflows/default/main.js";

async function generate(request: Request, response: Response) {
    const prompt = String(request.body.prompt ?? "");
    const text = await workflow.run(prompt);
    response.json({ text });
}

export default generate;
