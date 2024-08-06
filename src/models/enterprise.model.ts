import { Schema, Document, model } from "mongoose";

export interface IEnterprise extends Document {
  name: string;
  description?: string;
  ruc?: string;
  socialReason?: string;
  commercialName?: string;
  logoUrl?: string;
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EnterpriseSchema: Schema = new Schema<IEnterprise>({
  name: { type: String, required: true, unique: true, index: true },
  description: { type: String },
  ruc: { type: String },
  socialReason: { type: String },
  commercialName: { type: String },
  logoUrl: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const EnterpriseModel = model<IEnterprise>("Enterprise", EnterpriseSchema);
export default EnterpriseModel;
