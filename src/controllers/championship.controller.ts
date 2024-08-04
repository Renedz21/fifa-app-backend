import { HTTP_RESPONSE_CODE } from "../constants/appHttpCode";
import uploadImage from "../lib/upload-image";
import { ChampionshipModel, MatchModel, PlayerModel } from "../models";
import catchErrors from "../utils/catchErrors";

//* Crear un campeonato
const createChampionship = catchErrors(async (req, res) => {
  const { championshipName, logoUrl, ...data } = req.body;

  const championship = await ChampionshipModel.exists({ championshipName });

  if (championship) {
    res.status(HTTP_RESPONSE_CODE.CONFLICT).json({
      status: "error",
      message: "Championship name already exists",
    });
  }

  if (logoUrl) {
    const url = await uploadImage("championships", logoUrl);
    data.logoUrl = url;
  }

  console.log(data);

  const newChampionship = await ChampionshipModel.create({
    championshipName,
    ...data,
  });

  res.status(HTTP_RESPONSE_CODE.CREATED).json({
    status: "success",
    data: newChampionship,
  });
});

//* Agregar un partido a un campeonato en específico
const addMatchInChampionship = catchErrors(async (req, res) => {
  const { teamA, teamB, date } = req.body;
  const { championshipId } = req.params;

  if (!teamA || !teamB || !date) {
    res.status(HTTP_RESPONSE_CODE.BAD_REQUEST).json({
      status: "error",
      message: "Campos requeridos faltantes",
    });
  }

  // Asegúrate de que el campeonato existe
  const championship = await ChampionshipModel.findById(championshipId)
    .select("championshipName matches enterpriseId")
    .lean();

  if (!championship) {
    res.status(HTTP_RESPONSE_CODE.NOT_FOUND).json({
      status: "error",
      message: "Championship not found",
    });
  }

  // Crear el nuevo partido
  const match = new MatchModel({
    championship: championshipId,
    enterpriseId: championship?.enterpriseId,
    teamA,
    teamB,
    date,
  });

  // Guardar el nuevo partido
  const savedMatch = await match.save();

  // Añadir el partido al campeonato sin usar lean, para poder usar métodos de Mongoose
  await ChampionshipModel.findByIdAndUpdate(
    championshipId,
    { $push: { matches: savedMatch._id } },
    { new: true } // Devuelve el documento actualizado
  );

  res.status(HTTP_RESPONSE_CODE.CREATED).json({
    status: "success",
    data: savedMatch,
  });
});

const getAllChampionships = catchErrors(async (req, res) => {
  const { page = 1, limit = 10, name } = req.query;

  const pageNum = Math.max(1, parseInt(page as string, 10));
  const limitNum = Math.max(1, parseInt(limit as string, 10));

  // Construir el filtro con base en el nombre si está presente
  const filter = name
    ? { championshipName: { $regex: new RegExp(name.toString(), "i") } }
    : {};

  // Usamos lean para mejorar el rendimiento ya que no necesitamos los métodos del documento Mongoose
  const championships = await ChampionshipModel.find(filter)
    .populate({
      path: "teams",
      select: "name logoUrl",
    })
    .select("championshipName logoUrl startDate endDate enterpriseId")
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum)
    .lean(); // Agrega .lean() para obtener objetos planos y mejorar el rendimiento

  // Obtener el total de campeonatos que coinciden con el filtro para la paginación
  const totalChampionships = await ChampionshipModel.countDocuments(filter);

  res.status(HTTP_RESPONSE_CODE.SUCCESS).json({
    status: "success",
    total: totalChampionships,
    page: pageNum,
    pages: Math.ceil(totalChampionships / limitNum),
    data: championships,
  });
});

const getOneChampionship = catchErrors(async (req, res) => {
  const { championshipId } = req.params;

  if (!championshipId) {
    res.status(HTTP_RESPONSE_CODE.BAD_REQUEST).json({
      status: "fail",
      message: "Championship ID is required",
    });
  }

  // Realizar la consulta con paginación y seleción de campos
  const championship = await ChampionshipModel.findOne({
    _id: championshipId,
  })
    .populate({
      path: "teams",
      select: "name logoUrl",
    })
    .populate({
      path: "matches",
      select: "teamA teamB date status",
      populate: [
        {
          path: "teamA",
          model: "Team",
          select: "name logoUrl",
        },
        {
          path: "teamB",
          model: "Team",
          select: "name logoUrl",
        },
      ],
    })
    .lean();

  res.status(HTTP_RESPONSE_CODE.SUCCESS).json({
    status: "success",
    data: championship,
  });
});

const updateChampionship = catchErrors(async (req, res) => {
  const { championshipId } = req.params;
  const { ...data } = req.body;

  const championship = await ChampionshipModel.findById({
    _id: championshipId,
  })
    .select("championshipName")
    .lean();

  if (!championship) {
    res.status(HTTP_RESPONSE_CODE.NOT_FOUND).json({
      status: "fail",
      message: "Championship not found",
    });
  }

  const updatedChampionship = await ChampionshipModel.findByIdAndUpdate(
    championshipId,
    data,
    {
      new: true,
    }
  );

  res.status(HTTP_RESPONSE_CODE.SUCCESS).json({
    status: "success",
    data: updatedChampionship,
    message: "Championship updated successfully",
  });
});

const updateTeamsInChampionship = catchErrors(async (req, res) => {
  const { championshipId } = req.params;
  const { teams } = req.body; // Asumimos que estos son los ID de los equipos a agregar

  // Buscar el campeonato y actualizarlo en una sola operación si es posible
  const updatedChampionship = await ChampionshipModel.findByIdAndUpdate(
    championshipId,
    { $addToSet: { teams: { $each: teams } } }, // Utiliza $addToSet para evitar duplicados automáticamente
    { new: true, select: "championshipName teams" } // Devuelve el documento actualizado
  ).populate("teams", "name logoUrl"); // Si necesitas información específica de los equipos, populalos aquí

  if (!updatedChampionship) {
    res.status(HTTP_RESPONSE_CODE.NOT_FOUND).json({
      status: "fail",
      message: "Championship not found",
    });
  }

  res.status(HTTP_RESPONSE_CODE.SUCCESS).json({
    status: "success",
    data: updatedChampionship,
    message: "Equipos actualizados correctamente",
  });
});

const deleteChampionship = catchErrors(async (req, res) => {
  const { championshipId } = req.params;
  const championship = await ChampionshipModel.findByIdAndUpdate(
    championshipId,
    {
      isActive: false,
    }
  );

  if (!championship) {
    res.status(HTTP_RESPONSE_CODE.NOT_FOUND).json({
      status: "fail",
      message: "Championship not found",
    });
  }

  res.status(HTTP_RESPONSE_CODE.SUCCESS).json({
    status: "success",
    message: "Championship deactivated successfully",
  });
});

//* Obtener Estadísticas de un Campeonato
const getChampionshipStats = catchErrors(async (req, res) => {
  const { championshipId } = req.params;

  const championship = await ChampionshipModel.findById(championshipId)
    .select("teams matches")
    .populate("teams matches")
    .lean();

  console.log(championship);

  if (!championship) {
    res.status(HTTP_RESPONSE_CODE.NOT_FOUND).json({
      status: "fail",
      message: "Championship not found",
    });
  }

  const totalTeams = championship?.teams.length;
  const totalMatches = championship?.matches.length;

  // Obtener el total de goles usando agregación
  const totalGoalsResult = await MatchModel.aggregate([
    { $match: { championship: championshipId } },
    {
      $group: {
        _id: null,
        totalGoals: {
          $sum: {
            $add: ["$scoreTeamA", "$scoreTeamB"],
          },
        },
      },
    },
  ]);

  // Verificar si la agregación devolvió resultados
  const totalGoals =
    totalGoalsResult.length > 0 ? totalGoalsResult[0].totalGoals : 0;

  const stats = {
    totalTeams,
    totalMatches,
    totalGoals,
  };

  res.status(HTTP_RESPONSE_CODE.SUCCESS).json({
    status: "success",
    data: stats,
  });
});

export {
  createChampionship,
  updateTeamsInChampionship,
  getAllChampionships,
  getOneChampionship,
  deleteChampionship,
  updateChampionship,
  getChampionshipStats,
  addMatchInChampionship,
};
