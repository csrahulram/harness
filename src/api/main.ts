// Groups the API routes and their handlers
import { Router } from "express";
import generate from "./modules/generate.js";
import status from "./modules/status.js";
import corsAll from "./modules/cors.js";


const api = Router();

api.use(corsAll);

api.get("/status", status);
api.post("/generate", generate);

export default api;