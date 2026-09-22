import app from "./app.js";
import { env } from "./config/index.js";
import { connectRedis } from "./app/utils/redis.js";
import http from "http";
import { initSocket } from "./socket.js";

async function bootstrap() {
	try {
		await connectRedis();

		const server = http.createServer(app);
		initSocket(server);

		server.listen(env.PORT, () => {
			console.log(`Server is running on port ${env.PORT}`);
		});
	} catch (err) {
		console.error("Failed to start server:", err);
	}
}

bootstrap();
