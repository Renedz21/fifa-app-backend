import { HTTP_RESPONSE_CODE } from "../constants/appHttpCode";
import { envs } from "../constants/environment";
import { EnterpriseModel } from "../models";
import PlayerModel from "../models/player.model";
import catchErrors from "../utils/catchErrors";

import jwt from "jsonwebtoken";

const createPlayer = catchErrors(async (req, res) => {
  const { username, ...data } = req.body;

  const { enterpriseId } = req;

  const player = await PlayerModel.exists({ username });
  const enterprise = await EnterpriseModel.exists({ _id: enterpriseId });

  if (player) {
    res.status(HTTP_RESPONSE_CODE.CONFLICT).json({
      status: "error",
      message: "El nombre de usuario ya existe",
    });
    return;
  }

  if (!enterprise) {
    res.status(HTTP_RESPONSE_CODE.NOT_FOUND).json({
      status: "error",
      message: "La empresa no existe",
    });
    return;
  }

  const newUser = await PlayerModel.create({ username, enterpriseId, ...data });

  newUser.omitPassword();

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
  } = req.query;
  const { enterpriseId } = req;

  const pageNum = Math.max(1, parseInt(page as string, 10)); // Asegurarse de que la página no sea menor que 1
  const limitNum = Math.max(1, parseInt(limit as string, 10)); // Asegurarse de que el límite no sea menor que 1

  const sortQuery = { [sort as any]: order === "desc" ? -1 : 1 };

  // Contar sólo los jugadores que pertenecen a la empresa especificada
  const totalPlayers = await PlayerModel.countDocuments({ enterpriseId });

  // Obtener los jugadores que pertenecen a la empresa especificada
  const players = await PlayerModel.find({
    enterpriseId,
    role: "player",
  })
    .select("-password")
    .sort(sortQuery as any)
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum)
    .lean(); // Utilizar lean para mejorar el rendimiento de la consulta
  if (players.length === 0) {
    res.status(HTTP_RESPONSE_CODE.NOT_FOUND).json({
      status: "error",
      message: "No se encontraron jugadores",
    });
    return;
  }

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
      res.status(HTTP_RESPONSE_CODE.NOT_FOUND).send("User not found");
    }

    res.json(user);
  } catch (error) {
    res
      .status(HTTP_RESPONSE_CODE.SERVER_ERROR)
      .send("Error updating favorite team");
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
      res.status(HTTP_RESPONSE_CODE.NOT_FOUND).send("User not found");
    }

    res.json(user);
  } catch (error) {
    res
      .status(HTTP_RESPONSE_CODE.SERVER_ERROR)
      .send("Error updating favorite team");
  }
});

const getActualUser = catchErrors(async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    res
      .status(HTTP_RESPONSE_CODE.UNAUTHORIZED)
      .json({ message: "No token provided" });
  }
  const decoded = jwt.verify(token, envs.JWT_KEY);
  res.status(HTTP_RESPONSE_CODE.SUCCESS).json(decoded);
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
