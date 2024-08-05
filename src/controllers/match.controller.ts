import { HTTP_RESPONSE_CODE } from "../constants/appHttpCode";
import {
  ChampionshipModel,
  MatchModel,
  ResultModel,
  TeamModel,
} from "../models";
import catchErrors from "../utils/catchErrors";

const createMatch = catchErrors(async (req, res) => {
  const { championship, teamA, teamB, date } = req.body;
  const { enterpriseId } = req;
  // Validar datos esenciales
  if (!championship || !teamA || !teamB || !date) {
    res.status(HTTP_RESPONSE_CODE.BAD_REQUEST).json({
      status: "fail",
      message:
        "Missing required fields: championship, teamA, teamB, and date are all required.",
    });
    return;
  }

  // Verificar que el campeonato exista
  const championshipExists = await ChampionshipModel.exists({
    _id: championship,
  });

  if (!championshipExists) {
    res.status(HTTP_RESPONSE_CODE.NOT_FOUND).json({
      status: "fail",
      message: "Championship not found",
    });
    return;
  }

  // Verificar que ambos equipos existan antes de crear el partido
  const teamAExists = await TeamModel.exists({ _id: teamA });
  const teamBExists = await TeamModel.exists({ _id: teamB });

  if (!teamAExists || !teamBExists) {
    res.status(HTTP_RESPONSE_CODE.NOT_FOUND).json({
      status: "fail",
      message: "One or both teams not found",
    });
    return;
  }

  // Crear el partido
  const match = await MatchModel.create({
    championship,
    teamA,
    teamB,
    date,
    enterpriseId,
  });
  res.status(HTTP_RESPONSE_CODE.CREATED).json({
    status: "success",
    data: match,
  });
});

const getMatches = catchErrors(async (req, res) => {
  const { page = 1, limit = 10 } = req.query; // Obtener los parámetros de paginación desde la query

  const { enterpriseId } = req; // Obtener el ID de la organización desde el middleware

  const pageNum = Math.max(1, parseInt(page as string, 10)); // Asegurar que la página es al menos 1
  const limitNum = Math.max(1, parseInt(limit as string, 10)); // Asegurar que el límite es al menos 1

  // Calcular el número total de partidos para la paginación
  const totalMatches = await MatchModel.countDocuments({ enterpriseId });

  // Obtener los partidos con paginación y población limitada
  const matches = await MatchModel.find({
    enterpriseId,
  })
    .select("championship teamA teamB date status scoreTeamA scoreTeamB") // Seleccionar solo los campos necesarios
    .populate({
      path: "championship",
      select: "championshipName logoUrl", // Selección específica para reducir la carga de datos
    })
    .populate({
      path: "teamA",
      select: "name logoUrl",
      populate: [
        {
          path: "players",
          select: "name lastNam",
        },
      ],
    })
    .skip((pageNum - 1) * limitNum) // Saltar los documentos de páginas anteriores
    .limit(limitNum) // Limitar el número de documentos retornados
    .lean(); // Usar lean para mejorar el rendimiento

  res.status(HTTP_RESPONSE_CODE.SUCCESS).json({
    status: "success",
    total: totalMatches,
    page: pageNum,
    pages: Math.ceil(totalMatches / limitNum), // Calcular el total de páginas
    data: matches,
  });
});

const updateMatchResult = catchErrors(async (req, res) => {
  const { matchId } = req.params;
  const { scoreTeamA, scoreTeamB, draw } = req.body;

  // Validar que ambos puntajes estén presentes
  if (scoreTeamA == null || scoreTeamB == null) {
    res.status(HTTP_RESPONSE_CODE.BAD_REQUEST).json({
      error: "Both scores are required",
    });
    return;
  }

  // Buscar el partido y actualizar su puntaje
  const match = await MatchModel.findByIdAndUpdate(
    matchId,
    {
      scoreTeamA,
      scoreTeamB,
      status: "completed",
      updatedAt: new Date(),
    },
    { new: true }
  );

  if (!match) {
    res.status(HTTP_RESPONSE_CODE.NOT_FOUND).json({
      error: "Match not found",
    });
    return;
  }

  // Determinar el equipo ganador y perdedor
  let winningTeam = null;
  let losingTeam = null;

  if (scoreTeamA > scoreTeamB) {
    winningTeam = match.teamA;
    losingTeam = match.teamB;
  } else if (scoreTeamA < scoreTeamB) {
    winningTeam = match.teamB;
    losingTeam = match.teamA;
  }

  // Crear o actualizar el resultado del partido
  const resultData = {
    matchId: match._id,
    enterpriseId: match.enterpriseId,
    winningTeam: winningTeam || "",
    losingTeam: losingTeam || "",
    draw: draw || false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await ResultModel.findOneAndUpdate(
    { matchId: match._id },
    resultData,
    { new: true, upsert: true } // Crear un nuevo documento si no existe
  );

  res.status(HTTP_RESPONSE_CODE.SUCCESS).json({
    success: true,
    match,
    result,
  });
});

export { createMatch, getMatches, updateMatchResult };
