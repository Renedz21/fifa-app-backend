import { Schema, Document, model } from "mongoose";

interface IResult extends Document {
  match: string; // ID del partido
  winningTeam: string; // ID del equipo ganador
  losingTeam: string; // ID del equipo perdedor
  draw: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ResultSchema: Schema = new Schema({
  match: { type: Schema.Types.ObjectId, ref: "Match", required: true },
  winningTeam: { type: Schema.Types.ObjectId, ref: "Team" },
  losingTeam: { type: Schema.Types.ObjectId, ref: "Team" },
  draw: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const ResultModel = model<IResult>("Result", ResultSchema);
export default ResultModel;
