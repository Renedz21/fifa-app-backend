import { Schema, Document, model } from "mongoose";

interface IMatch extends Document {
  championship: string; // ID del campeonato
  teamA: {
    name: string;
    logoUrl: string;
  };
  teamB: {
    name: string;
    logoUrl: string;
  };
  scoreTeamA: number;
  scoreTeamB: number;
  date: Date;
  status: "scheduled" | "played";
  createdAt: Date;
  updatedAt: Date;
}

const MatchSchema: Schema = new Schema({
  championship: {
    type: Schema.Types.ObjectId,
    ref: "Championship",
    required: true,
  },
  teamA: {
    name: { type: String, required: true },
    logoUrl: { type: String, required: true },
  },
  teamB: {
    name: { type: String, required: true },
    logoUrl: { type: String, required: true },
  },
  scoreTeamA: { type: Number, default: 0 },
  scoreTeamB: { type: Number, default: 0 },
  date: { type: Date, required: true },
  status: { type: String, enum: ["scheduled", "played"], default: "scheduled" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const MatchModel = model<IMatch>("Match", MatchSchema);
export default MatchModel;
