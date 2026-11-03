// Attaches a WebSocket server and broadcasts JSON to every client
import { WebSocketServer } from "ws";
import type { Server } from "node:http";

function CreateSocket(server: Server, onMessage: (data: any) => Promise<unknown>) {

    const sockets = new WebSocketServer({ server });

    function broadcast(message: unknown) {
        const text = JSON.stringify(message);
        sockets.clients.forEach(client => client.send(text));
    }

    sockets.on("connection", socket => {
        socket.on("message", async raw => {
            const result = await onMessage(JSON.parse(raw.toString()));
            if (result) broadcast(result);
        });
    });

    return broadcast;
}

export default CreateSocket;
