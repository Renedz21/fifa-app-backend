import mongoose, { Schema, Document } from "mongoose";

interface IMatch extends Document {
  teamA: string; // ID del equipo A
  teamB: string; // ID del equipo B
  scoreTeamA: number;
  scoreTeamB: number;
  date: Date;
  status: "scheduled" | "played";
  createdAt: Date;
  updatedAt: Date;
}

const MatchSchema: Schema = new Schema({
  teamA: { type: Schema.Types.ObjectId, ref: "Team", required: true },
  teamB: { type: Schema.Types.ObjectId, ref: "Team", required: true },
  scoreTeamA: { type: Number, default: 0 },
  scoreTeamB: { type: Number, default: 0 },
  date: { type: Date, required: true },
  status: { type: String, enum: ["scheduled", "played"], default: "scheduled" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model<IMatch>("Match", MatchSchema);
