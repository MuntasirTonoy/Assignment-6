import dotenv from "dotenv";
import path from "node:path";
import { z } from "zod";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const envSchema = z.object({
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
	PORT: z.string().default("5000"),
	DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
	REDIS_USERNAME: z.string().default("default"),
	REDIS_PASSWORD: z.string().optional().default(""),
	REDIS_HOST: z.string().min(1, "REDIS_HOST is required"),
	REDIS_PORT: z.string().default("15930").transform(Number),
	JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
	GOOGLE_CLIENT_ID: z.string().optional(),
	GOOGLE_CLIENT_SECRET: z.string().optional(),
	SESSION_SECRET: z
		.string()
		.min(1, "SESSION_SECRET is required")
		.default("super-secret-session-key"),
	BKASH_APP_KEY: z.string().min(1, "BKASH_APP_KEY is required"),
	BKASH_APP_SECRET: z.string().min(1, "BKASH_APP_SECRET is required"),
	BKASH_USERNAME: z.string().min(1, "BKASH_USERNAME is required"),
	BKASH_PASSWORD: z.string().min(1, "BKASH_PASSWORD is required"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
	console.error("❌ Invalid environment variables:", parsedEnv.error.format());
	throw new Error("Invalid environment variables");
}

export const env = parsedEnv.data;
