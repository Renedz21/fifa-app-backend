import fs from "fs";
import path from "path";

import catchErrors from "../utils/catchErrors";
import { HTTP_RESPONSE_CODE } from "../constants/appHttpCode";
import { TeamModel } from "../models";
import uploadImage from "../lib/upload-image";

export const createTeam = catchErrors(async (req, res) => {
  const { name, logoUrl, ...data } = req.body;

  const team = await TeamModel.exists({ name });

  if (team) {
    res.status(HTTP_RESPONSE_CODE.BAD_REQUEST).json({
      error: "Team already exists",
    });
  }

  if (logoUrl) {
    const logo = await uploadImage("teams", logoUrl);

    if (!logo) {
      res.status(HTTP_RESPONSE_CODE.BAD_REQUEST).json({
        error: "Error uploading the image",
      });
    }

    data.logoUrl = logo;
  }

  const newTeam = await TeamModel.create({
    name,
    ...data,
  });

  res.status(HTTP_RESPONSE_CODE.CREATED).json({
    success: true,
    data: newTeam,
  });
});

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

export const getTeamsDb = catchErrors(async (req, res) => {
  const teams = await TeamModel.find()
    .populate({
      path: "players",
      select: "_id fullName email username avatarUrl ",
    })
    .sort({ createdAt: -1 })
    .exec();

  if (!teams) {
    res.status(HTTP_RESPONSE_CODE.NOT_FOUND).json({ error: "Teams not found" });
  }

  res.status(HTTP_RESPONSE_CODE.SUCCESS).json({
    success: true,
    teams,
  });
});
