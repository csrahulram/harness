// Builds the CORS middleware for the API
import cors from "cors";

const corsAll = cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
});

export default corsAll;
