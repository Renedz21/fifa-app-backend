import { Document, model, Schema } from "mongoose";
import { compareValue, hashValue } from "../lib/encrypt";

export interface PlayerDocument extends Document {
  username: string;
  email: string;
  password: string;
  fullName: string;
  avatarUrl?: string;
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
  createdAt: Date;
  updatedAt: Date;
  verified: boolean;
  comparePassword(val: string): Promise<boolean>;
  omitPassword(): Pick<
    PlayerDocument,
    "_id" | "email" | "verified" | "createdAt" | "updatedAt" | "__v"
  >;
}

const PlayerSchema: Schema = new Schema<PlayerDocument>(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    verified: { type: Boolean, required: true, default: false },
    fullName: { type: String, required: true },
    avatarUrl: { type: String },
    favoriteTeam: {
      name: { type: String, required: true, default: "" },
      logoUrl: { type: String, required: true, default: "" },
    },
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

PlayerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await hashValue(this.password as string);
  return next();
});

PlayerSchema.methods.comparePassword = async function (val: string) {
  return compareValue(val, this.password);
};

PlayerSchema.methods.omitPassword = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

const PlayerModel = model<PlayerDocument>("Player", PlayerSchema);
export default PlayerModel;
