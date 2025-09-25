import { PrismaClient } from "@prisma/client";
import { WebSocketServer, WebSocket } from "ws";

const prisma = new PrismaClient();

const wss = new WebSocketServer({ port: 3004 });

console.log("WebSocket server is running on port 3004");

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === "NEW_MESSAGE" && data.sender_id) {
        const newMessage = await prisma.messages.create({
          data: {
            chat_id: data.chat_id,
            sender_id: data.sender_id,
            content: data.content,
            file_type: data.file_type || null, // Կամայական դաշտեր
            file_paths: data.file_paths || null,
            selected_chat_id: data.selected_chat_id || null,
            created_at: new Date(),
          },
        });

        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({ type: "MESSAGE", payload: newMessage }),
            );
          }
        });
      }
    } catch (error) {
      console.error("Error handling message:", error);
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});
