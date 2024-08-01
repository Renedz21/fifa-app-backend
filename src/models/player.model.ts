import { Document, model, Schema, ObjectId } from "mongoose";
import { compareValue, hashValue } from "../lib/encrypt";

enum Role {
  Player = "player",
  Admin = "admin",
}

export interface PlayerDocument extends Document {
  username: string;
  tenantId: string | ObjectId; // ID de la organización
  email: string;
  password: string;
  fullName: string;
  avatarUrl?: string;
  provider?: string;
  role: string;
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
    | "_id"
    | "email"
    | "verified"
    | "createdAt"
    | "updatedAt"
    | "__v"
    | "role"
    | "username"
    | "fullName"
    | "avatarUrl"
    | "favoriteTeam"
    | "skillLevel"
    | "statistics"
    | "strengths"
  >;
}

const PlayerSchema: Schema = new Schema<PlayerDocument>(
  {
    username: { type: String, unique: true },
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant" },
    email: { type: String, unique: true },
    password: { type: String },
    verified: { type: Boolean, default: false },
    provider: { type: String, default: "email" },
    role: { type: String, default: Role.Player },
    fullName: { type: String },
    avatarUrl: { type: String },
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
