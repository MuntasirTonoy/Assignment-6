import app from "./app.js";
import { env } from "./config/index.js";
import { connectRedis } from "./app/utils/redis.js";

async function bootstrap() {
	try {
		await connectRedis();
		
		app.listen(env.PORT, () => {
			console.log(`Server is running on port ${env.PORT}`);
		});
	} catch (err) {
		console.error("Failed to start server:", err);
	}
}

bootstrap();
