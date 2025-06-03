import express from "express";
import { NextFunction, Response, Request } from "express";
import axios from "axios";
import cors from "cors";
import userRouter from "./routes/users/user.routes";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import billsRouter  from "./routes/bills/bills.routes";
import { FRONTEND_URI } from "./config";
const app = express();

app.use(
  cors({
    origin: FRONTEND_URI,
    credentials: true,
  })
);

app.use(express.json());
app.get(`/health`, (req: Request, res: Response) => {
  res.json({ status: "ok" });
});
app.use("/api/v1/users", userRouter);
app.use(`/api/v1/bills`, billsRouter);


const PORT = process.env.PORT || 8080;
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  globalErrorHandler(err, req, res, next);
});
app.listen(PORT, () => {
  console.log(`Server Listening at http://localhost:${PORT}`);
});
