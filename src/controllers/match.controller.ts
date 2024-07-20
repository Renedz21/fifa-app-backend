import { HTTP_RESPONSE_CODE } from "../constants/appHttpCode";
import { ChampionshipModel, MatchModel } from "../models";
import catchErrors from "../utils/catchErrors";

const createMatch = catchErrors(async (req, res) => {
  const { championship, teamA, teamB, date } = req.body;

  // Validar datos esenciales
  if (!championship || !teamA || !teamB || !date) {
    res.status(HTTP_RESPONSE_CODE.BAD_REQUEST).json({
      status: "fail",
      message: "Missing required fields",
    });
  }

  // Verificar que el campeonato existe
  const championshipExists = await ChampionshipModel.exists({
    _id: championship,
  });

  if (!championshipExists) {
    res.status(HTTP_RESPONSE_CODE.NOT_FOUND).json({
      status: "fail",
      message: "Championship not found",
    });
  }

  // Crear el partido
  const match = await MatchModel.create(req.body);

  res.status(HTTP_RESPONSE_CODE.CREATED).json({
    status: "success",
    data: match,
  });
});

const getMatches = catchErrors(async (req, res) => {
  const matches = await MatchModel.find().populate("championship");

  res.status(200).json({
    status: "success",
    data: matches,
  });
});

export { createMatch, getMatches };
