import { HttpStatusCode } from "../constants/appHttpCode";
import AppErrorCode from "../constants/errorCode";

class AppError extends Error {
  constructor(
    public statusCode: HttpStatusCode,
    public message: string,
    public errorCode?: AppErrorCode
  ) {
    super(message);
  }
}

export default AppError;
