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

const getMatchResults = catchErrors(async (req, res) => {
  const { enterpriseId } = req;

  // Comprobar si se proporcionó enterpriseId, lo cual es esencial para la búsqueda
  if (!enterpriseId) {
    res.status(HTTP_RESPONSE_CODE.BAD_REQUEST).json({
      status: "fail",
      message: "Enterprise ID is required",
    });
    return;
  }

  // Recuperar resultados de partidos específicos para la empresa dada
  const results = await ResultModel.find({ enterpriseId })
    .populate({
      path: "winningTeam",
      select: "name",
    })
    .populate({
      path: "losingTeam",
      select: "name",
    })
    .lean();
  // .select("matchId winningTeam losingTeam createdAt updatedAt")

  // Si no se encuentran resultados, responder con un mensaje adecuado
  if (!results.length) {
    res.status(HTTP_RESPONSE_CODE.NOT_FOUND).json({
      status: "fail",
      message: "No match results found for the given enterprise",
    });
    return;
  }

  // Enviar los resultados recuperados
  res.status(HTTP_RESPONSE_CODE.SUCCESS).json({
    status: "success",
    data: results,
  });
});

export { createMatchResult, getMatchResults };
