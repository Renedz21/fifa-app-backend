import { HTTP_RESPONSE_CODE } from "../constants/appHttpCode";
import PlayerModel from "../models/player.model";
import catchErrors from "../utils/catchErrors";

export const createPlayer = catchErrors(async (req, res) => {
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

  res.status(HTTP_RESPONSE_CODE.SUCCESS).json({
    status: "success",
    data: player,
    message: "Usuario actualizado correctamente",
  });
});

export const deletePlayer = catchErrors(async (req, res) => {
  const { userId } = req.params;

  const player = await PlayerModel.findOneAndDelete({ _id: userId });

  res.status(HTTP_RESPONSE_CODE.SUCCESS).json({
    status: "success",
    message: "Usuario eliminado correctamente",
  });
});

export const selectFavoriteTeam = catchErrors(async (req, res) => {
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

export const updateFavoriteTeam = catchErrors(async (req, res) => {
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
