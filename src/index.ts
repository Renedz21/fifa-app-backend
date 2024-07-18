import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import { envs } from "./constants/environment";
import connection from "./config/connection";
import errorHandler from "./middleware/errorHandler.middleware";
import { PlayerRoute } from "./routes";

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: envs.APP_ORIGIN,
    methods: ["GET", "POST", "PATCH", "DELETE"],
  })
);
app.use(helmet());

app.use("/api/v1/player", PlayerRoute);

app.use(errorHandler);

app.listen(envs.PORT, () => {
  connection();
  console.log(`Server running on port ${envs.PORT}`);
});
