// This is a model loader
import { pipeline, env } from "@huggingface/transformers"
import path from "node:path";
import { access } from "node:fs/promises"
import 'dotenv/config'
import ModelDownloader from "./ModelDownloader.js";


async function modelLoader(model: string, dtype: string, device: string = "webgpu") {


    console.log('Loading the model')

    const modelRoot = process.env.LOCAL_MODEL_PATH;

    if (!modelRoot) {
        throw new Error("LOCAL_MODEL_PATH is missing from .env");
    }

    const modelDirectory = path.resolve(modelRoot, model);


    try {
        await access(path.join(modelDirectory, "config.json"));
    } catch {
        console.log("Model not found locally, downloading...");
        await ModelDownloader(model, modelDirectory, dtype)
    }


    env.localModelPath = path.resolve(modelRoot);
    env.allowRemoteModels = false;
    env.allowLocalModels = true;


    const generator = await pipeline('text-generation', model, { dtype: dtype as any, device: device as any, progress_callback: progressCallback, local_files_only: true });
    return generator;
}

function progressCallback() {
    console.log('Working...')
}

export default modelLoader;