import { Schema, Document, model } from "mongoose";

interface IChampionship extends Document {
  championshipName: string;
  tenantId: string; // ID de la organización
  teams: {
    name: string;
    logoUrl: string;
  }[];
  matches: string[]; // Array de IDs de partidos
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChampionshipSchema: Schema = new Schema({
  championshipName: { type: String, required: true, index: true },
  tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true },
  teams: [
    {
      name: { type: String, required: true },
      logoUrl: { type: String, required: true },
    },
  ],
  matches: [{ type: Schema.Types.ObjectId, ref: "Match" }],
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const ChampionshipModel = model<IChampionship>(
  "Championship",
  ChampionshipSchema
);

export default ChampionshipModel;
