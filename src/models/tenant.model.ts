import { Schema, Document, model } from "mongoose";

interface ITenant extends Document {
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TenantSchema: Schema = new Schema<ITenant>({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const TenantModel = model<ITenant>("Tenant", TenantSchema);
export default TenantModel;
