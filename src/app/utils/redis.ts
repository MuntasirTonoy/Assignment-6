import Redis from "ioredis";
import { env } from "../../config/index.js";

export const redis = new Redis({
	host: env.REDIS_HOST,
	port: env.REDIS_PORT,
	username: env.REDIS_USERNAME,
	password: env.REDIS_PASSWORD,
	lazyConnect: true, // Requires explicit connect() call
	maxRetriesPerRequest: 3,
	retryStrategy(times) {
		return Math.min(times * 50, 2000);
	},
});

redis.on("connect", () => {
	console.log("✅ Redis connected successfully");
});

redis.on("error", (err) => {
	console.error("❌ Redis connection error:", err);
});

export const connectRedis = async () => {
	try {
		await redis.connect();
	} catch (err) {
		console.error("Failed to connect to Redis", err);
		process.exit(1);
	}
};
