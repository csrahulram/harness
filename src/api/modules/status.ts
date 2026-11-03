// Handles the status route
import type { Request, Response } from "express";

async function status(request: Request, response: Response) {
    response.json({ status: "ok", uptime: process.uptime() });
}

export default status;
