import express, {
	type Application,
	type Request,
	type Response,
} from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app: Application = express();

// Parsers
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: "*", credentials: true }));

app.get("/", (req: Request, res: Response) => {
	res.send("Welcome to the assignment 6");
});

export default app;
