import fs from "fs";
import path from "path";

import catchErrors from "../utils/catchErrors";
import { HTTP_RESPONSE_CODE } from "../constants/appHttpCode";

export const getTeams = catchErrors(async (req, res) => {
  const filePath = path.join(__dirname, "../data", "main.json");

  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Error reading the file" });
    }
    try {
      const teams = JSON.parse(data);
      res.status(HTTP_RESPONSE_CODE.SUCCESS).json(teams);
    } catch (err) {
      res.status(500).json({ error: "Error parsing the file" });
    }
  });
});
