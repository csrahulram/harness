// This is going to be the entry point for the application. It will initialize the application and set up any necessary configurations.

import api from "./api/main.js";
import CreateServer from "./modules/CreateServer.js";
import modelLoader from "./modules/ModelLoader.js";
import CreateSocket from "./modules/CreateSocket.js";
import HandleCommand from "./modules/HandleCommand.js";


async function init() {
    // const textGenerator = await modelLoader('onnx-community/SmolLM2-135M-ONNX');
    // const result = await textGenerator('Generate a small greeting text', { max_new_tokens: 20 });
    // console.log(result[0]?.generated_text);

    const apiServer = CreateServer('./src/api', 3200, api);
    const chatServer = CreateServer('./src/chat', 3000);
    const dashbordServer = CreateServer('./src/dashboard', 3100);

    const broadcast = CreateSocket(dashbordServer, HandleCommand)
}


init(); 