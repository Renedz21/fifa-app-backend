import { HTTP_RESPONSE_CODE } from "../constants/appHttpCode";
import { MatchModel, ResultModel } from "../models";
import catchErrors from "../utils/catchErrors";

const createMatchResult = catchErrors(async (req, res) => {
  const { matchId, winningTeam, losingTeam } = req.body;

  // Validar datos esenciales
  if (!matchId || !winningTeam || !losingTeam) {
    res.status(HTTP_RESPONSE_CODE.BAD_REQUEST).json({
      status: "fail",
      message: "Missing required fields",
    });
  }

  // Verificar que el campeonato existe
  const matchExists = await MatchModel.exists({
    _id: matchId,
  });

  if (!matchExists) {
    res.status(HTTP_RESPONSE_CODE.NOT_FOUND).json({
      status: "fail",
      message: "Match not found",
    });
  }

  // Crear el resultado final
  const result = await ResultModel.create(req.body);

  res.status(HTTP_RESPONSE_CODE.CREATED).json({
    status: "success",
    data: result,
  });
});

export { createMatchResult };
