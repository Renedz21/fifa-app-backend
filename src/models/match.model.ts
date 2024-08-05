import { Schema, Document, model } from "mongoose";

enum TypeStatus {
  scheduled = "scheduled",
  played = "played",
  completed = "completed",
}

interface IMatch extends Document {
  championship: string; // ID del campeonato
  enterpriseId: string; // ID de la organización
  teamA: string; // ID del equipo A
  teamB: string; // ID del equipo B
  scoreTeamA: number;
  scoreTeamB: number;
  date: Date;
  status: TypeStatus;
  createdAt: Date;
  updatedAt: Date;
}

const MatchSchema: Schema = new Schema({
  championship: {
    type: Schema.Types.ObjectId,
    ref: "Championship",
    required: true,
  },
  enterpriseId: {
    type: Schema.Types.ObjectId,
    ref: "Enterprise",
    required: true,
  },
  teamA: { type: Schema.Types.ObjectId, ref: "Team", required: true },
  teamB: { type: Schema.Types.ObjectId, ref: "Team", required: true },
  scoreTeamA: { type: Number, default: 0 },
  scoreTeamB: { type: Number, default: 0 },
  date: { type: Date, required: true },
  status: { type: String, enum: [TypeStatus], default: TypeStatus.scheduled },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const MatchModel = model<IMatch>("Match", MatchSchema);
export default MatchModel;
