import { Schema, Document, model } from "mongoose";

interface IResult extends Document {
  matchId: string; // ID del partido
  enterpriseId: string; // ID de la organización
  winningTeam: string;
  losingTeam: string;
  draw: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ResultSchema: Schema = new Schema({
  matchId: { type: Schema.Types.ObjectId, ref: "Match", required: true },
  enterpriseId: {
    type: Schema.Types.ObjectId,
    ref: "Enterprise",
    required: true,
  },
  winningTeam: { type: Schema.Types.ObjectId, ref: "Team", required: true },
  losingTeam: { type: Schema.Types.ObjectId, ref: "Team", required: true },
  draw: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const ResultModel = model<IResult>("Result", ResultSchema);
export default ResultModel;
