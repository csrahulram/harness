// Creates an Express server that serves a folder
import express from "express";
import type { Router } from "express";

function CreateServer(folder: string, port: number, api?: Router) {

    const app = express();

    app.use(express.json());

    if (api) {
        app.use("/api", api);
    }

    app.use(express.static(folder));

    const server = app.listen(port, () => console.log(`Serving ${folder} on http://localhost:${port}`));

    return server;
}

export default CreateServer;
