import { HTTP_RESPONSE_CODE } from "../constants/appHttpCode";
import { envs } from "../constants/environment";
import { AdminModel, EnterpriseModel, PlayerModel, UserModel } from "../models";
import "dotenv/config";
import catchErrors from "../utils/catchErrors";

import jwt from "jsonwebtoken";

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Request, Response, NextFunction } from "express";
import { ADMIN, PLAYER } from "../constants/constants";

const GOOGLE_CLIENT_ID = envs.PRIVATE_CLIENT_ID || "your-client-id";
const GOOGLE_CLIENT_SECRET = envs.PRIVATE_CLIENT_SECRET || "your-client-secret";
const JWT_SECRET = envs.JWT_KEY || "your-jwt-secret";

export const login = catchErrors(async (req, res) => {
  const { email, password } = req.body;

  const user = await UserModel.findOne({ email }).populate({
    path: "enterpriseId",
    select: "name",
  });

  if (!user) {
    res
      .status(HTTP_RESPONSE_CODE.UNAUTHORIZED)
      .json({ error: "Invalid credentials" });
    return;
  }

  const isValid = await user?.comparePassword(password);

  if (!isValid) {
    res
      .status(HTTP_RESPONSE_CODE.UNAUTHORIZED)
      .json({ error: "Invalid credentials" });
    return;
  }

  const token = jwt.sign(
    {
      userId: user?._id,
      role: user?.role,
      email: user?.email,
      enterpriseId: user?.enterpriseId,
    },
    JWT_SECRET,
    {
      expiresIn: "1h",
    }
  );

  res.cookie("token", token, {
    httpOnly: process.env.NODE_ENV === "production",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(Date.now() + 3600000), // 1 hour
    maxAge: 3600000,
  });

  res.status(HTTP_RESPONSE_CODE.SUCCESS).json({
    token,
    user: user.omitPassword(),
  });
});

export const register = catchErrors(async (req, res) => {
  const { name, email, password, role, organizationName } = req.body;
  let user;

  if (!name || !email || !password || !role) {
    res
      .status(HTTP_RESPONSE_CODE.BAD_REQUEST)
      .json({ error: "Please provide all required fields" });
  }

  const existingUser = await UserModel.exists({ email });
  if (existingUser) {
    res
      .status(HTTP_RESPONSE_CODE.BAD_REQUEST)
      .json({ error: "Email already exists" });
  }

  let company = await EnterpriseModel.findOne({ name: organizationName });

  if (!company) {
    company = new EnterpriseModel({ name: organizationName });
    await company.save();
  }

  if (role === PLAYER) {
    user = new PlayerModel({
      name,
      email,
      password,
      role,
      enterpriseId: company._id,
    });
  } else if (role === ADMIN) {
    user = new AdminModel({
      name,
      email,
      password,
      role,
      enterpriseId: company._id,
    });
  } else {
    res.status(HTTP_RESPONSE_CODE.BAD_REQUEST).json({ error: "Invalid role" });
  }

  await user?.save();
  res
    .status(HTTP_RESPONSE_CODE.CREATED)
    .json({ success: true, user: user?.omitPassword() });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: envs.REDIRECT_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      if (!profile.emails || !profile.emails[0]) {
        return done(null, undefined);
      }

      const user = await PlayerModel.findOne({
        email: profile.emails[0].value,
      });

      if (user) {
        return done(null, user);
      }

      const newUser = new PlayerModel({
        email: profile.emails[0].value,
        username: profile.displayName,
        avatarUrl: profile.photos
          ? profile.photos[0].value
          : profile._json.picture,
        fullName: profile.displayName,
        verified: true,
        provider: profile.provider,
      });

      await newUser.save();
      return done(null, newUser);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user as any);
});

export const generateToken = (user: any) => {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
};

export const authenticateGoogle = passport.authenticate("google", {
  scope: ["profile", "email"],
});

export const authenticateGoogleCallback = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate("google", (err: any, user: any, info: any) => {
    if (err || !user) {
      return res.redirect("http://localhost:5173/login");
    }
    const token = generateToken(user);
    res.cookie("token", token, {
      // httpOnly: true,
      httpOnly: process.env.NODE_ENV === "production",
      secure: process.env.NODE_ENV === "production",
      expires: new Date(Date.now() + 3600000), // 1 hour
      maxAge: 3600000,
    });
    res.send({
      token,
      user,
    });
    res.redirect("http://localhost:5173/");
  })(req, res, next);
};
