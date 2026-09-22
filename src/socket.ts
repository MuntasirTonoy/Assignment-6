import { Server as SocketIOServer } from "socket.io";
import type { Server as HTTPServer } from "http";

let io: SocketIOServer;

export const initSocket = (server: HTTPServer) => {
	io = new SocketIOServer(server, {
		cors: {
			origin: "*", // Allow all origins for dev
			methods: ["GET", "POST"],
		},
	});

	io.on("connection", (socket) => {
		console.log(`Socket connected: ${socket.id}`);

		socket.on("disconnect", () => {
			console.log(`Socket disconnected: ${socket.id}`);
		});
	});

	return io;
};

export const getIo = () => {
	if (!io) {
		throw new Error("Socket.io not initialized!");
	}
	return io;
};
