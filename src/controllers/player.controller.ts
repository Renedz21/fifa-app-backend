import { HTTP_RESPONSE_CODE } from "../constants/appHttpCode";
import PlayerModel from "../models/user.model";
import appAssert from "../utils/appAsset";
import catchErrors from "../utils/catchErrors";

export const createPlayer = catchErrors(async (req, res) => {
  // Validar si el usuario ya existe
  const { username, ...data } = req.body;

  const player = await PlayerModel.exists({ username });

  appAssert(!player, HTTP_RESPONSE_CODE.CONFLICT, "El usuario ya existe");

  // Crear un nuevo usuario

  const newUser = await PlayerModel.create({ username, ...data });

  // Enviar respuesta

  res.status(HTTP_RESPONSE_CODE.CREATED).json({
    status: "success",
    data: newUser,
  });
});

export const getAllPlayers = catchErrors(async (req, res) => {
  const players = await PlayerModel.find();

  res.status(HTTP_RESPONSE_CODE.SUCCESS).json({
    status: "success",
    data: players,
  });
});

export const getOnePlayer = catchErrors(async (req, res) => {
  const { userId } = req.params;

  const player = await PlayerModel.findOne({ _id: userId });

  appAssert(player, HTTP_RESPONSE_CODE.CONFLICT, "Usuario no encontrado");

  res.status(HTTP_RESPONSE_CODE.SUCCESS).json({
    status: "success",
    data: player,
  });
});

export const updatePlayer = catchErrors(async (req, res) => {
  const { userId } = req.params;
  const { ...data } = req.body;

  const player = await PlayerModel.findOneAndUpdate({ _id: userId }, data, {
    new: true,
  });

  appAssert(player, HTTP_RESPONSE_CODE.CONFLICT, "Usuario no encontrado");

  res.status(HTTP_RESPONSE_CODE.SUCCESS).json({
    status: "success",
    data: player,
    message: "Usuario actualizado correctamente",
  });
});

export const deletePlayer = catchErrors(async (req, res) => {
  const { userId } = req.params;

  const player = await PlayerModel.findOneAndDelete({ _id: userId });

  appAssert(player, HTTP_RESPONSE_CODE.CONFLICT, "Usuario no encontrado");

  res.status(HTTP_RESPONSE_CODE.SUCCESS).json({
    status: "success",
    message: "Usuario eliminado correctamente",
  });
});
