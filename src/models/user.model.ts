import { Document, model, Schema, ObjectId } from "mongoose";
import { compareValue, hashValue } from "../lib/encrypt";
import { Role } from "../constants/constants";

export interface IUser extends Document {
  enterpriseId: ObjectId; // ID de la organización
  email: string;
  password: string;
  name: string;
  lastName: string;
  avatarUrl?: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  verified: boolean;
  comparePassword(val: string): Promise<boolean>;
  omitPassword(): Pick<
    IUser,
    | "_id"
    | "email"
    | "verified"
    | "createdAt"
    | "updatedAt"
    | "__v"
    | "role"
    | "name"
    | "lastName"
    | "avatarUrl"
  >;
}

const UserSchema: Schema = new Schema<IUser>(
  {
    enterpriseId: { type: Schema.Types.ObjectId, ref: "Enterprise" },
    email: { type: String, unique: true },
    password: { type: String },
    verified: { type: Boolean, default: false },
    role: {
      type: String,
      enum: [Role.PLAYER, Role.ADMIN],
      default: Role.PLAYER,
      required: true,
    },
    name: { type: String, required: true },
    lastName: { type: String },
    avatarUrl: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await hashValue(this.password as string);
  return next();
});

UserSchema.methods.comparePassword = async function (val: string) {
  return compareValue(val, this.password);
};

UserSchema.methods.omitPassword = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

const UserModel = model<IUser>("User", UserSchema);
export default UserModel;
