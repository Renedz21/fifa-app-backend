import { Schema, Document, model } from "mongoose";

interface IChampionship extends Document {
  championshipName: string;
  teams: {
    name: string;
    logoUrl: string;
  }[];
  matches: string[]; // Array de IDs de partidos
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ChampionshipSchema: Schema = new Schema({
  championshipName: { type: String, required: true, index: true },
  teams: [
    {
      name: { type: String, required: true },
      logoUrl: { type: String, required: true },
    },
  ],
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
