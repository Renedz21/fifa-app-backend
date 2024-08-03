import { HTTP_RESPONSE_CODE } from "../constants/appHttpCode";
import { envs } from "../constants/environment";
import PlayerModel from "../models/player.model";
import catchErrors from "../utils/catchErrors";

import jwt from "jsonwebtoken";

const createPlayer = catchErrors(async (req, res) => {
  const { username, ...data } = req.body;

  const player = await PlayerModel.exists({ username });

  if (player) {
    res.status(HTTP_RESPONSE_CODE.CONFLICT).json({
      status: "error",
      message: "El nombre de usuario ya existe",
    });
  }

  const newUser = await PlayerModel.create({ username, ...data });

  res.status(HTTP_RESPONSE_CODE.CREATED).json({
    status: "success",
    data: newUser,
  });
});

const getAllPlayers = catchErrors(async (req, res) => {
  const {
    limit = 10,
    page = 1,
    sort = "createdAt",
    order = "desc",
    tenantId,
  } = req.query;

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  const sortQuery = {
    [sort as string]: order === "desc" ? -1 : 1,
  };

  const players = await PlayerModel.find({ tenantId })
    .populate({
      path: "tenantId",
      select: "_id name",
    })
    .sort(sortQuery as any)
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  const totalPlayers = await PlayerModel.countDocuments();

  res.status(HTTP_RESPONSE_CODE.SUCCESS).json({
    status: "success",
    total: totalPlayers,
    page: pageNum,
    pages: Math.ceil(totalPlayers / limitNum),
    data: players,
  });
});

const getOnePlayer = catchErrors(async (req, res) => {
  const { userId } = req.params;

  const player = await PlayerModel.findOne({ _id: userId });

  res.status(HTTP_RESPONSE_CODE.SUCCESS).json({
    status: "success",
    data: player,
  });
});

const updatePlayer = catchErrors(async (req, res) => {
  const { userId } = req.params;
  const { ...data } = req.body;

  const player = await PlayerModel.findOneAndUpdate({ _id: userId }, data, {
    new: true,
  });

  res.status(HTTP_RESPONSE_CODE.SUCCESS).json({
    status: "success",
    data: player,
    message: "Usuario actualizado correctamente",
  });
});

const deletePlayer = catchErrors(async (req, res) => {
  const { userId } = req.params;

  const player = await PlayerModel.findOneAndDelete({ _id: userId });

  res.status(HTTP_RESPONSE_CODE.SUCCESS).json({
    status: "success",
    message: "Usuario eliminado correctamente",
  });
});

const selectFavoriteTeam = catchErrors(async (req, res) => {
  const { userId } = req.params;
  const { name, logoUrl } = req.body;

  try {
    const user = await PlayerModel.findByIdAndUpdate(
      { _id: userId },
      { favoriteTeam: { name, logoUrl } },
      { new: true }
    );

    if (!user) {
      res.status(404).send("User not found");
    }

    res.json(user);
  } catch (error) {
    res.status(500).send("Error updating favorite team");
  }
});

const updateFavoriteTeam = catchErrors(async (req, res) => {
  const { userId } = req.params;
  const { name, logoUrl } = req.body;

  try {
    const user = await PlayerModel.findByIdAndUpdate(
      { _id: userId },
      { favoriteTeam: { name, logoUrl } },
      { new: true }
    );

    if (!user) {
      res.status(404).send("User not found");
    }

    res.json(user);
  } catch (error) {
    res.status(500).send("Error updating favorite team");
  }
});

const getActualUser = catchErrors(async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    res.status(401).json({ message: "No token provided" });
  }
  const decoded = jwt.verify(token, envs.JWT_KEY);
  res.status(200).json(decoded);
});

export {
  createPlayer,
  getAllPlayers,
  getOnePlayer,
  updatePlayer,
  deletePlayer,
  selectFavoriteTeam,
  updateFavoriteTeam,
  getActualUser,
};
