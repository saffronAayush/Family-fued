import { Server } from "socket.io";

let io; // to store socket instance

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", // change to your frontend URL in production
    },
  });

  io.on("connection", (socket) => {
    console.log("🔌 New client connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });

  return io;
};

// helper to get socket instance anywhere
export const getIo = () => {
  if (!io) {
    throw new Error("❌ Socket.io not initialized!");
  }
  return io;
};
