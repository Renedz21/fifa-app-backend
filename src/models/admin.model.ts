import { Schema } from "mongoose";
import UserModel, { IUser } from "./user.model";

export interface IAdmin extends IUser {}

const AdminSchema: Schema = new Schema<IAdmin>();

const AdminModel = UserModel.discriminator<IAdmin>("Admin", AdminSchema);
export default AdminModel;
