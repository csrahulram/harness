// Default workflow: answers a prompt with the local thinking model
import { Workflow } from "../../abstract/Workflow.js";

class DefaultWorkflow extends Workflow {
    model = "onnx-community/Qwen3-0.6B-ONNX";
    dtype = "q4f16";

    async run(prompt: string) {
        const generator = await this.load();
        const messages = [{ role: "user", content: prompt }];
        const output = await generator(messages, { max_new_tokens: 256 });
        return output[0].generated_text.at(-1).content.trim();
    }
}

export default new DefaultWorkflow();
