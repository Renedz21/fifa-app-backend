import { Schema, Document, model } from "mongoose";

interface IChampionship extends Document {
  name: string;
  teams: string[]; // Array de IDs de equipos
  matches: string[]; // Array de IDs de partidos
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ChampionshipSchema: Schema = new Schema({
  name: { type: String, required: true },
  teams: [{ type: Schema.Types.ObjectId, ref: "Team" }],
  matches: [{ type: Schema.Types.ObjectId, ref: "Match" }],
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const ChampionshipModel = model<IChampionship>(
  "Championship",
  ChampionshipSchema
);

export default ChampionshipModel;
