// Base class for workflows: loads its model once and answers a prompt
import modelLoader from "../modules/ModelLoader.js";

export abstract class Workflow {
    abstract model: string;
    abstract dtype: string;
    device: string = "webgpu";

    private generator: any;

    async load() {
        if (!this.generator) this.generator = await modelLoader(this.model, this.dtype, this.device);
        return this.generator;
    }

    abstract run(prompt: string): Promise<string>;
}
