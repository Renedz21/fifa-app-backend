import { Document, model, Schema } from "mongoose";

export interface IPlayerDocument extends Document {
  username: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  position: string;
  skillLevel: {
    offense: number;
    defense: number;
    stamina: number;
    speed: number;
    technique: number;
  };
  statistics: {
    matchesPlayed: number;
    matchesWon: number;
    matchesLost: number;
    goalsScored: number;
    assists: number;
    yellowCards: number;
    redCards: number;
  };
  strengths: string[];
  createdAt: Date;
  updatedAt: Date;
}

const PlayerSchema: Schema = new Schema<IPlayerDocument>(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    avatarUrl: { type: String },
    position: { type: String, required: true },
    skillLevel: {
      offense: { type: Number, required: true, min: 0, max: 100 },
      defense: { type: Number, required: true, min: 0, max: 100 },
      stamina: { type: Number, required: true, min: 0, max: 100 },
      speed: { type: Number, required: true, min: 0, max: 100 },
      technique: { type: Number, required: true, min: 0, max: 100 },
    },
    statistics: {
      matchesPlayed: { type: Number, default: 0 },
      matchesWon: { type: Number, default: 0 },
      matchesLost: { type: Number, default: 0 },
      goalsScored: { type: Number, default: 0 },
      assists: { type: Number, default: 0 },
      yellowCards: { type: Number, default: 0 },
      redCards: { type: Number, default: 0 },
    },
    strengths: [{ type: String }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const PlayerModel = model<IPlayerDocument>("Player", PlayerSchema);
export default PlayerModel;
