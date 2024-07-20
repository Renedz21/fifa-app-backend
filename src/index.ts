import express, { Application } from "express";
import cors from "cors";
import compress from "compression";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import connection from "./config/connection";
import configureGlobalErrorHandler from "./middleware/error.handler";
import { envs } from "./constants/environment";
import { createLogger } from "./lib/logger";
import {
  PlayerRoute,
  TeamRoute,
  CampionshipRoute,
  MatchRoute,
  ResultRoute,
} from "./routes";

const app: Application = express();
const logger = createLogger();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: envs.APP_ORIGIN,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);
app.use(
  helmet({
    noSniff: true,
    xssFilter: true,
    hidePoweredBy: true,
    frameguard: {
      action: "deny",
    },
  })
);
app.use(compress());

app.use("/api/v1/players", PlayerRoute);
app.use("/api/v1/teams", TeamRoute);
app.use("/api/v1/championships", CampionshipRoute);
app.use("/api/v1/match", MatchRoute);
app.use("/api/v1/results", ResultRoute);

app.use(configureGlobalErrorHandler(logger));

app.listen(envs.PORT, () => {
  connection();
  console.log(`Server running on port ${envs.PORT}`);
});
