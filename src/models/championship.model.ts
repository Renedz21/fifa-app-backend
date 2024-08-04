import { Schema, Document, model } from "mongoose";

enum ChampionshipStatus {
  TO_BEGIN = "TO_BEGIN",
  IN_COURSE = "IN_COURSE",
  FINISHED = "FINISHED",
}

interface IChampionship extends Document {
  championshipName: string;
  logoUrl: string;
  enterpriseId: string; // ID de la organización
  teams: string[];
  matches: string[]; // Array de IDs de partidos
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ChampionshipSchema: Schema = new Schema({
  championshipName: { type: String, required: true, index: true },
  logoUrl: { type: String, required: false, default: "" },
  enterpriseId: {
    type: Schema.Types.ObjectId,
    ref: "Enterprise",
    required: true,
  },
  teams: [{ type: Schema.Types.ObjectId, ref: "Team" }],
  matches: [{ type: Schema.Types.ObjectId, ref: "Match" }],
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: {
    type: String,
    enum: Object.values(ChampionshipStatus),
    default: ChampionshipStatus.TO_BEGIN,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const ChampionshipModel = model<IChampionship>(
  "Championship",
  ChampionshipSchema
);

export default ChampionshipModel;
