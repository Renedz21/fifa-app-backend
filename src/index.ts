import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import { envs } from "./constants/environment";
import connection from "./config/connection";
import { PlayerRoute, TeamRoute } from "./routes";
import configureGlobalErrorHandler from "./middleware/error.handler";
import { createLogger } from "./lib/logger";

const app: Application = express();
const logger = createLogger();

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
app.use("/api/v1/teams", TeamRoute);

app.use(configureGlobalErrorHandler(logger));

app.listen(envs.PORT, () => {
  connection();
  console.log(`Server running on port ${envs.PORT}`);
});
