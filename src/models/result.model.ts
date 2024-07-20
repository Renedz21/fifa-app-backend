import { Schema, Document, model } from "mongoose";

interface IResult extends Document {
  matchId: string; // ID del partido
  winningTeam: {
    name: string;
    logoUrl: string;
  };
  losingTeam: {
    name: string;
    logoUrl: string;
  };
  draw: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ResultSchema: Schema = new Schema({
  matchId: { type: Schema.Types.ObjectId, ref: "Match", required: true },
  winningTeam: {
    name: {
      type: String,
    },
    logoUrl: {
      type: String,
    },
  },
  losingTeam: {
    name: {
      type: String,
    },
    logoUrl: {
      type: String,
    },
  },
  draw: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const ResultModel = model<IResult>("Result", ResultSchema);
export default ResultModel;
