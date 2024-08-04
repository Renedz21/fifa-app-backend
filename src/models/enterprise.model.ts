import { Schema, Document, model } from "mongoose";

export interface IEnterprise extends Document {
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EnterpriseSchema: Schema = new Schema<IEnterprise>({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const EnterpriseModel = model<IEnterprise>("Enterprise", EnterpriseSchema);
export default EnterpriseModel;
