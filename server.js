import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { GoogleGenAI } from "@google/genai";
import Message from "./models/Message.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

app.post("/api/chat", async (req, res) => {
  try {
   const { chatId, messages } = req.body;
    const userMessage = messages[messages.length - 1];

if (userMessage && userMessage.sender === "user") {
 await Message.create({
  chatId: chatId,
  sender: "user",
  text: userMessage.text,
});
}

    const contents = messages.map((msg) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [
        {
          text: msg.text,
        },
      ],
    }));

    const response = await ai.models.generateContent({
   model: "gemini-3-flash-preview",
      contents: contents,
    });

   await Message.create({
  chatId: chatId,
  sender: "bot",
  text: response.text,
});

    res.json({
      reply: response.text,
    });

    } catch (error) {
    console.error("GEMINI ERROR:");
    console.error(error);
    console.error("MESSAGE:", error.message);
    console.error("STATUS:", error.status);

    res.status(500).json({
      error: "Something went wrong",
    });
  }
});

app.get("/api/messages", async (req, res) => {
  try {
    const { chatId } = req.query;

const messages = await Message.find({ chatId }).sort({ time: 1 });

    res.json(messages);
  } catch (error) {
    console.error("FETCH MESSAGES ERROR:", error);
    res.status(500).json({
      error: "Could not fetch messages",
    });
  }
});

app.get("/api/chat-history", async (req, res) => {
  try {
    const chats = await Message.aggregate([
      {
        $match: {
          chatId: { $exists: true },
        },
      },
      {
        $sort: {
          time: 1,
        },
      },
      {
        $group: {
          _id: "$chatId",
          messages: {
            $push: "$$ROOT",
          },
        },
      },
    ]);

    res.json(chats);
  } catch (error) {
    console.error("CHAT HISTORY ERROR:", error);

    res.status(500).json({
      error: "Could not fetch chat history",
    });
  }
});

app.delete("/api/messages/:chatId", async (req, res) => {
  try {
    const { chatId } = req.params;

    await Message.deleteMany({ chatId });

    res.json({
      message: "Chat deleted successfully",
    });
  } catch (error) {
    console.error("DELETE CHAT ERROR:", error);

    res.status(500).json({
      error: "Could not delete chat",
    });
  }
});



app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});