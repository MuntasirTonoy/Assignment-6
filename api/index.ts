import app from "../src/app.js";
import { connectRedis } from "../src/app/utils/redis.js";

connectRedis().catch(console.error);

export default app;
