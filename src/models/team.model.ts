import { Schema, Document, model } from "mongoose";

interface ITeam extends Document {
  name: string;
  logoUrl?: string;
  enterpriseId: string;
  players: string[]; // Array de IDs de jugadores
  createdAt: Date;
  updatedAt: Date;
}

const TeamSchema: Schema = new Schema({
  name: { type: String, required: true },
  logoUrl: { type: String, required: false, default: "" },
  players: [{ type: Schema.Types.ObjectId, ref: "Player", required: true }],
  enterpriseId: {
    type: Schema.Types.ObjectId,
    ref: "Enterprise",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const TeamModel = model<ITeam>("Team", TeamSchema);
export default TeamModel;
