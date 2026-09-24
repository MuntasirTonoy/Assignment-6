import express, {
	type Application,
	type Request,
	type Response,
	type NextFunction,
} from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import router from "./app/routes/index.js";
import { globalErrorHandler } from "./app/errors/globalErrorHandler.js";
import session from "express-session";
import passport from "./config/passport.js";
import { env } from "./config/index.js";

const app: Application = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
	session({
		secret: env.SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
		cookie: { secure: env.NODE_ENV === "production" },
	}),
);

app.use(passport.initialize());
app.use(passport.session());

// Global Routes
app.use("/api/v1", router);

// Root route
app.get("/", (_req: Request, res: Response) => {
	res.json({
		success: true,
		message: "Ambulance Dispatch Service API is running",
	});
});

// 404 Handler
app.use((_req: Request, res: Response, _next: NextFunction) => {
	res.status(404).json({
		success: false,
		message: "API endpoint not found",
		errors: [],
	});
});

// Global Error Handler
app.use(globalErrorHandler);

export default app;
