import fs from "fs";
import path from "path";

import catchErrors from "../utils/catchErrors";
import { HTTP_RESPONSE_CODE } from "../constants/appHttpCode";
import { TeamModel } from "../models";
import uploadImage from "../lib/upload-image";

const createTeam = catchErrors(async (req, res) => {
  const { name, logoUrl, ...data } = req.body;
  const { enterpriseId } = req;

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
      return;
    }

    data.logoUrl = logo;
  }

  const newTeam = await TeamModel.create({
    name,
    enterpriseId,
    ...data,
  });

  res.status(HTTP_RESPONSE_CODE.CREATED).json({
    success: true,
    data: newTeam,
  });
});

const getTeams = catchErrors(async (req, res) => {
  const filePath = path.join(__dirname, "../data", "main.json");

  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      return res
        .status(HTTP_RESPONSE_CODE.SERVER_ERROR)
        .json({ error: "Error reading the file" });
    }
    try {
      const teams = JSON.parse(data);
      res.status(HTTP_RESPONSE_CODE.SUCCESS).json(teams);
    } catch (err) {
      res
        .status(HTTP_RESPONSE_CODE.SERVER_ERROR)
        .json({ error: "Error parsing the file" });
    }
  });
});

const getTeamsDb = catchErrors(async (req, res) => {
  const { page, limit, name } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 2);
  const { enterpriseId } = req;

  const filter = name
    ? { name: { $regex: new RegExp(name.toString(), "i") } }
    : {};

  const teams = await TeamModel.find({
    ...filter,
    enterpriseId,
  })
    .select("logoUrl name players")
    .populate({
      path: "players",
      select: "name lastName email avatarUrl",
    })
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum)
    .lean();

  const totalTeams = await TeamModel.countDocuments(filter);

  if (!teams) {
    res.status(HTTP_RESPONSE_CODE.NOT_FOUND).json({ error: "Teams not found" });
  }

  res.status(HTTP_RESPONSE_CODE.SUCCESS).json({
    success: true,
    total: totalTeams,
    page: pageNum,
    totalPages: pageNum > 0 ? Math.ceil(totalTeams / limitNum) : 0,
    data: teams,
  });
});

const updateTeam = catchErrors(async (req, res) => {
  const { teamId } = req.params;
  const { logoUrl, ...data } = req.body;

  const team = await TeamModel.findById(teamId);

  if (!team) {
    res.status(HTTP_RESPONSE_CODE.NOT_FOUND).json({ error: "Team not found" });
    return;
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

  const updatedTeam = await TeamModel.findByIdAndUpdate(
    teamId,
    { ...data },
    { new: true }
  );

  res.status(HTTP_RESPONSE_CODE.SUCCESS).json({
    success: true,
    data: updatedTeam,
  });
});

export { createTeam, getTeams, getTeamsDb, updateTeam };
