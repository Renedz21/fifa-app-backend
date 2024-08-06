import { HTTP_RESPONSE_CODE } from "../constants/appHttpCode";
import { EnterpriseModel } from "../models";
import catchErrors from "../utils/catchErrors";

const createEnterprise = catchErrors(async (req, res) => {
  const { name, ...data } = req.body;

  // Validar datos esenciales
  if (!name) {
    res.status(HTTP_RESPONSE_CODE.BAD_REQUEST).json({
      status: "fail",
      message: "Name field is required",
    });
  }

  // Verificar que el tenant no exista
  const enterpriseExists = await EnterpriseModel.exists({ name });
  if (enterpriseExists) {
    res.status(HTTP_RESPONSE_CODE.CONFLICT).json({
      status: "fail",
      message: "Tenant already exists",
    });
  }

  // Crear el tenant
  const result = await EnterpriseModel.create({ name, ...data });

  res.status(HTTP_RESPONSE_CODE.CREATED).json({
    status: "success",
    data: result,
  });
});

const getEnterprises = catchErrors(async (req, res) => {
  const enterprises = await EnterpriseModel.find().lean();

  if (!enterprises.length) {
    res.status(HTTP_RESPONSE_CODE.NOT_FOUND).json({
      status: "fail",
      message: "No enterprises found",
    });
    return;
  }

  res.status(HTTP_RESPONSE_CODE.SUCCESS).json({
    status: "success",
    data: enterprises,
  });
});

const updateEnterprise = catchErrors(async (req, res) => {
  const { enterpriseId } = req.params;
  const { ...data } = req.body;

  // Verificar que el enterprise exista antes de intentar actualizarlo
  const enterprise = await EnterpriseModel.exists({ _id: enterpriseId });
  if (!enterprise) {
    res.status(HTTP_RESPONSE_CODE.NOT_FOUND).json({
      status: "fail",
      message: "Enterprise not found",
    });
    return;
  }

  // Actualizar el enterprise
  const updatedEnterprise = await EnterpriseModel.findByIdAndUpdate(
    enterpriseId,
    { ...data },
    { new: true, runValidators: true } // Asegurar que los validadores del esquema se apliquen
  );

  // En caso de que la actualización falle (findByIdAndUpdate no devuelve objeto si no encuentra el ID)
  if (!updatedEnterprise) {
    res.status(HTTP_RESPONSE_CODE.SERVER_ERROR).json({
      status: "fail",
      message: "Failed to update the enterprise",
    });
    return;
  }

  // Respuesta exitosa con el enterprise actualizado
  res.status(HTTP_RESPONSE_CODE.SUCCESS).json({
    status: "success",
    data: updatedEnterprise,
  });
});

const deleteEnterprise = catchErrors(async (req, res) => {
  const { enterpriseId } = req.params;

  const enterprise = await EnterpriseModel.findByIdAndUpdate(
    enterpriseId,
    { isActive: false },
    { new: true } // Esta opción retorna el documento actualizado
  );

  if (!enterprise) {
    res.status(HTTP_RESPONSE_CODE.NOT_FOUND).json({
      status: "fail",
      message: "Championship not found",
    });
    return;
  }

  res.status(HTTP_RESPONSE_CODE.SUCCESS).json({
    status: "success",
    message: "Enterprise deleted successfully",
  });
});

export { createEnterprise, getEnterprises, updateEnterprise, deleteEnterprise };
