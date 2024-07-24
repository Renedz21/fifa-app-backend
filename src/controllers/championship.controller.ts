import { ChampionshipModel } from "../models";
import catchErrors from "../utils/catchErrors";

const createChampionship = catchErrors(async (req, res) => {
  const { championshipName, ...data } = req.body;

  const championship = await ChampionshipModel.exists({ championshipName });

  if (championship) {
    res.status(409).json({
      status: "error",
      message: "Championship name already exists",
    });
  }

  const newChampionship = await ChampionshipModel.create({
    championshipName,
    ...data,
  });

  res.status(201).json({
    status: "success",
    data: newChampionship,
  });
});

const getAllChampionships = catchErrors(async (req, res) => {
  const { page = 1, limit = 10, fields } = req.query;

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  // Crear opciones de selección de campos
  let selectFields = "";
  if (typeof fields === "string") {
    selectFields = fields.split(",").join(" ");
  }

  // Realizar la consulta con paginación y seleción de campos
  const championships = await ChampionshipModel.find()
    .select(selectFields)
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  // Obtener el total de campenatos para la paginación
  const totalChampionships = await ChampionshipModel.countDocuments();

  res.status(200).json({
    status: "success",
    total: totalChampionships,
    page: pageNum,
    pages: Math.ceil(totalChampionships / limitNum),
    data: championships,
  });
});

const getOneChampionship = catchErrors(async (req, res) => {
  const { championshipId } = req.params;
  // Realizar la consulta con paginación y seleción de campos
  const championship = await ChampionshipModel.findOne({
    _id: championshipId,
  });

  res.status(200).json({
    status: "success",
    data: championship,
  });
});

const updateChampionship = catchErrors(async (req, res) => {
  const { championshipId } = req.params;
  const { ...data } = req.body;

  const championship = await ChampionshipModel.findById({
    _id: championshipId,
  });

  if (!championship) {
    res.status(404).json({
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

  res.status(200).json({
    status: "success",
    data: updatedChampionship,
    message: "Championship updated successfully",
  });
});

const updateTeamsInChampionship = catchErrors(async (req, res) => {
  const { championshipId } = req.params;
  const { teams } = req.body;

  const championship = await ChampionshipModel.findById(championshipId);

  if (!championship) {
    res.status(404).json({
      status: "fail",
      message: "Championship not found",
    });
  }

  // Filtrar equipos que ya existen para evitar duplicados
  const existingTeamNames = new Set(
    championship?.teams.map((team) => team.name)
  );
  const newTeams = teams.filter(
    (team: any) => !existingTeamNames.has(team.name)
  );

  // Agregar los nuevos equipos al campeonato
  championship?.teams.push(...newTeams);

  // Guardar el campeonato actualizado
  await championship?.save();

  res.status(200).json({
    status: "success",
    data: championship,
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
    res.status(404).json({
      status: "fail",
      message: "Championship not found",
    });
  }

  res.status(200).json({
    status: "success",
    message: "Championship deactivated successfully",
  });
});

export {
  createChampionship,
  updateTeamsInChampionship,
  getAllChampionships,
  getOneChampionship,
  deleteChampionship,
  updateChampionship,
};
