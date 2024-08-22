import { HTTP_RESPONSE_CODE } from "../constants/appHttpCode";
import uploadImage from "../lib/upload-image";
import { ChampionshipModel, MatchModel } from "../models";
import catchErrors from "../utils/catchErrors";

//* Crear un campeonato
const createChampionship = catchErrors(async (req, res, next) => {
  const { championshipName, logoUrl, ...data } = req.body;
  const { enterpriseId } = req;

  // Asegúrate de que el nombre del campeonato no está vacío
  if (!championshipName) {
    res.status(HTTP_RESPONSE_CODE.BAD_REQUEST).json({
      status: "error",
      message: "El nombre del campeonato es obligatorio.",
    });
    return;
  }

  // Verificar que el campeonato no exista ya para esta empresa
  const championshipExists = await ChampionshipModel.exists({
    championshipName,
    enterpriseId,
  });

  if (championshipExists) {
    res.status(HTTP_RESPONSE_CODE.CONFLICT).json({
      status: "error",
      message: "Ya existe un campeonato con ese nombre en tu empresa.",
    });
    return;
  }

  // Si se proporciona logoUrl, subir la imagen
  if (logoUrl) {
    try {
      const url = await uploadImage("championships", logoUrl);
      data.logoUrl = url;
    } catch (error) {
      next(error);
      return;
    }
  }

  // Crear el campeonato
  const newChampionship = await ChampionshipModel.create({
    championshipName,
    enterpriseId,
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
  const { enterpriseId } = req;

  const pageNum = Math.max(1, parseInt(page as string, 10));
  const limitNum = Math.max(1, parseInt(limit as string, 10));

  // Construir el filtro con base en el nombre si está presente
  const filter = name
    ? { championshipName: { $regex: new RegExp(name.toString(), "i") } }
    : {};

  // Usamos lean para mejorar el rendimiento ya que no necesitamos los métodos del documento Mongoose
  const championships = await ChampionshipModel.find({
    ...filter,
    enterpriseId,
    // isActive: true, //TODO: Agregar isActive si es necesario
  })
    .populate({
      path: "teams",
      select: "name logoUrl",
    })
    .populate({
      path: "matches",
      select: "teamA teamB date status",
    })
    .select("championshipName logoUrl startDate endDate status")
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
      select: "name logoUrl players",
      populate: [
        {
          path: "players",
          select: "name",
        },
      ],
    })
    .populate({
      path: "enterpriseId",
      select: "name",
    })
    .populate({
      path: "matches",
      select: "teamA teamB date status scoreTeamA scoreTeamB",
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
  const { logoUrl, ...data } = req.body;

  // Primero, verificamos si el campeonato existe para evitar una actualización innecesaria
  const championship = await ChampionshipModel.findById(championshipId)
    .select("championshipName")
    .lean();

  if (!championship) {
    res.status(HTTP_RESPONSE_CODE.NOT_FOUND).json({
      status: "fail",
      message: "Championship not found",
    });
    return;
  }

  if (logoUrl) {
    const url = await uploadImage("championships", logoUrl);

    if (!url) {
      res.status(HTTP_RESPONSE_CODE.BAD_REQUEST).json({
        status: "fail",
        message: "Failed to upload image",
      });
      return;
    }
    data.logoUrl = url;
  }

  // Actualizar el campeonato solo si fue encontrado
  const updatedChampionship = await ChampionshipModel.findByIdAndUpdate(
    championshipId,
    data,
    { new: true, runValidators: true } // runValidators para asegurar que los datos sean validados según el esquema del modelo
  );

  if (!updatedChampionship) {
    res.status(HTTP_RESPONSE_CODE.NOT_FOUND).json({
      status: "fail",
      message: "Failed to update the championship",
    });
    return;
  }

  res.status(HTTP_RESPONSE_CODE.SUCCESS).json({
    status: "success",
    data: updatedChampionship,
    message: "Championship updated successfully",
  });
});

const updateTeamsInChampionship = catchErrors(async (req, res) => {
  const { championshipId } = req.params;
  const { teams } = req.body; // Array de IDs de equipos

  // Verificamos si el campeonato existe
  const existingChampionship = await ChampionshipModel.findById(
    championshipId
  ).select("championshipName");

  if (!existingChampionship) {
    res.status(HTTP_RESPONSE_CODE.NOT_FOUND).json({
      status: "fail",
      message: "Championship not found",
    });
    return;
  }

  // Buscar el campeonato y actualizarlo en una sola operación si es posible
  const updatedChampionship = await ChampionshipModel.findByIdAndUpdate(
    championshipId,
    { $addToSet: { teams: { $each: teams } } }, // Utiliza $addToSet para evitar duplicados automáticamente
    { new: true, select: "championshipName teams" } // Devuelve el documento actualizado
  ).populate("teams", "name logoUrl");

  if (!updatedChampionship) {
    res.status(HTTP_RESPONSE_CODE.NOT_FOUND).json({
      status: "fail",
      message: "Championship not found",
    });
    return;
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
    },
    {
      new: true,
    }
  );

  if (!championship) {
    res.status(HTTP_RESPONSE_CODE.NOT_FOUND).json({
      status: "fail",
      message: "Championship not found",
    });
    return;
  }

  res.status(HTTP_RESPONSE_CODE.SUCCESS).json({
    status: "success",
    message: "Championship deactivated successfully",
  });
});

//* Obtener Estadísticas de un Campeonato
const getChampionshipStats = catchErrors(async (req, res) => {
  const { championshipId } = req.params;

  const championship = await ChampionshipModel.findById({
    _id: championshipId,
  })
    .select("teams matches")
    .populate("teams", "matches")
    .populate("matches", "scoreTeamA scoreTeamB")
    .lean();

  if (!championship) {
    res.status(HTTP_RESPONSE_CODE.NOT_FOUND).json({
      status: "fail",
      message: "Championship not found",
    });
    return;
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
