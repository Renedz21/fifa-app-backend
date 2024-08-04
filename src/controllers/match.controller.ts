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
  const { page = 1, limit = 10 } = req.query; // Obtener los parámetros de paginación desde la query

  const pageNum = Math.max(1, parseInt(page as string, 10)); // Asegurar que la página es al menos 1
  const limitNum = Math.max(1, parseInt(limit as string, 10)); // Asegurar que el límite es al menos 1

  // Calcular el número total de partidos para la paginación
  const totalMatches = await MatchModel.countDocuments();

  // Obtener los partidos con paginación y población limitada
  const matches = await MatchModel.find()
    .populate({
      path: "championship",
      select: "championshipName logoUrl", // Selección específica para reducir la carga de datos
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

export { createMatch, getMatches };
