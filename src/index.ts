import express, { Application } from "express";
import passport from "passport";

import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import connection from "./config/connection";

import { verifyToken } from "./middleware/auth.middleware";
import configureGlobalErrorHandler from "./middleware/error.handler";

import { envs } from "./constants/environment";
import limiter from "./utils/limit";
import { createLogger } from "./lib/logger";
import "dotenv/config";

import {
  PlayerRoute,
  TeamRoute,
  CampionshipRoute,
  MatchRoute,
  ResultRoute,
  AuthRoute,
  EnterpriseRoute,
} from "./routes";
import { extractEnterpriseId } from "./middleware/extractEnterpriseId";

const app: Application = express();
const logger = createLogger();

app.use(passport.initialize());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? envs.APP_ORIGIN
        : "http://localhost:5173",
    credentials: true,
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
app.use(compression());
app.use("/api/v1", limiter); // Limitador de peticiones

app.use("/api/v1/test", (req, res) => {
  res.send("Hello World");
});

app.use("/api/v1/auth", AuthRoute);

app.use(verifyToken);
app.use(extractEnterpriseId);

app.use("/api/v1/players", PlayerRoute);
app.use("/api/v1/teams", TeamRoute);
app.use("/api/v1/championships", CampionshipRoute);
app.use("/api/v1/match", MatchRoute);
app.use("/api/v1/enterprise", EnterpriseRoute);
app.use("/api/v1/results", ResultRoute);

app.use(configureGlobalErrorHandler(logger));

app.listen(envs.PORT, () => {
  connection();
  console.log(`Server running on port ${envs.PORT}`);
});
