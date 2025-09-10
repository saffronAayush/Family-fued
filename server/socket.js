import { Server } from "socket.io";

// Track live participant connections (exclude admin sockets)
const liveParticipantSockets = new Set();

let io; // to store socket instance

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", // change to your frontend URL in production
    },
  });

  io.on("connection", (socket) => {
    console.log("🔌 New client connected:", socket.id);

    // Send current live users count to just-connected client
    socket.emit("liveUsers", { count: liveParticipantSockets.size });

    // Register client role (participant/admin)
    socket.on("register", ({ role } = {}) => {
      socket.role = role || "unknown";
      if (socket.role === "participant") {
        liveParticipantSockets.add(socket.id);
        io.emit("liveUsers", { count: liveParticipantSockets.size });
      }
    });

    socket.on("disconnect", () => {
      if (socket.role === "participant") {
        liveParticipantSockets.delete(socket.id);
        io.emit("liveUsers", { count: liveParticipantSockets.size });
      }
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
