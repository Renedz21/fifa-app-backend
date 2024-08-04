import { Schema } from "mongoose";
import UserModel, { IUser } from "./user.model";

export interface IPlayer extends IUser {
  favoriteTeam: {
    name: string;
    logoUrl: string;
  };
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
}

const PlayerSchema: Schema = new Schema<IPlayer>({
  favoriteTeam: {
    name: { type: String, default: "" },
    logoUrl: { type: String, default: "" },
  },
  skillLevel: {
    offense: { type: Number, min: 0, max: 100 },
    defense: { type: Number, min: 0, max: 100 },
    stamina: { type: Number, min: 0, max: 100 },
    speed: { type: Number, min: 0, max: 100 },
    technique: { type: Number, min: 0, max: 100 },
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
});

const PlayerModel = UserModel.discriminator<IPlayer>("Player", PlayerSchema);
export default PlayerModel;
