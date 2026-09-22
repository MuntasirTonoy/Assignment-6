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
	REDIS_PASSWORD: z.string().min(1, "REDIS_PASSWORD is required"),
	REDIS_HOST: z.string().min(1, "REDIS_HOST is required"),
	REDIS_PORT: z.string().default("15930").transform(Number),
	CLERK_SECRET_KEY: z.string().min(1, "CLERK_SECRET_KEY is required"),
	CLERK_PUBLISHABLE_KEY: z.string().optional(),
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
