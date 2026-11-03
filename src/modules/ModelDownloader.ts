// Downloads one model variant from Hugging Face into the local models folder
import { listFiles, downloadFile } from "@huggingface/hub";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

async function ModelDownloader(model: string, targetDir: string, dtype: string) {

    for await (const file of listFiles({ repo: model, recursive: true })) {
        if (file.type !== "file") continue;
        if (file.path.startsWith("onnxruntime/")) continue;
        if (file.path.startsWith("onnx/") && file.path !== `onnx/model_${dtype}.onnx`) continue;

        const blob = await downloadFile({ repo: model, path: file.path });
        if (!blob) continue;

        const destination = path.join(targetDir, file.path);

        await mkdir(path.dirname(destination), { recursive: true });
        await writeFile(destination, Buffer.from(await blob.arrayBuffer()));

        console.log(`Downloaded ${file.path}`);
    }

}

export default ModelDownloader;
