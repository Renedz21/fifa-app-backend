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
  const tenantExists = await EnterpriseModel.exists({ name });
  if (tenantExists) {
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
  const tenants = await EnterpriseModel.find();

  if (!tenants) {
    res.status(HTTP_RESPONSE_CODE.NOT_FOUND).json({
      status: "fail",
      message: "No tenants found",
    });
  }

  res.status(HTTP_RESPONSE_CODE.SUCCESS).json({
    status: "success",
    data: tenants,
  });
});

export { createEnterprise, getEnterprises };
