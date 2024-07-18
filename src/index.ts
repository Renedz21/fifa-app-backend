import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import { envs } from "./constants/environment";
import connection from "./config/connection";

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());
app.use(helmet());

app.listen(envs.PORT, () => {
  connection();
  console.log(`Server running on port ${envs.PORT}`);
});
