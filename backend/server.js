import express from "express";
import cors from "cors";
import { compiledGraph } from "./index.js";

const app = express();

// Enable CORS with explicit configuration
const corsOptions = {
    origin: "https://ask-pilot-eight.vercel.app",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, { origin: req.get('origin') });
    next();
});

app.get("/", (req, res) => {
    res.json({
        message: "AI Agent Backend is running"
    });
});

// Test endpoint to verify connection
app.get("/api/test", (req, res) => {
    res.json({ message: "Backend connection working!" });
});

app.post("/api/chat", async (req, res) => {
    try {
        const { message,thread_Id } = req.body;
        //console.log("Received message:", message);
        if (!message) {
            return res.status(400).json({
                error: "Message is required"
            });
        }

        const result = await compiledGraph.invoke(
            {
                messages: [
                    {
                        role: "user",
                        content: message
                    }
                ]
            },
            {
                configurable: {
                    thread_id: "thread_Id"
                }
            }
        );

        const lastMessage =
            result.messages[result.messages.length - 1];

        res.json({
            response: lastMessage.content
        });

    } catch (error) {
        console.log("not");
        
        console.error(error);

        res.status(500).json({
            error: "Something went wrong"
        });
    }
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});