import { Schema, Document, model } from "mongoose";

interface ITeam extends Document {
  name: string;
  logoUrl?: string;
  players: string[]; // Array de IDs de jugadores
  createdAt: Date;
  updatedAt: Date;
}

const TeamSchema: Schema = new Schema({
  name: { type: String, required: true },
  logoUrl: { type: String },
  players: [{ type: Schema.Types.ObjectId, ref: "Player" }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const TeamModel = model<ITeam>("Team", TeamSchema);
export default TeamModel;
