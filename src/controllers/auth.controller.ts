import { HTTP_RESPONSE_CODE } from "../constants/appHttpCode";
import { envs } from "../constants/environment";
import { PlayerModel } from "../models";
import "dotenv/config";
import catchErrors from "../utils/catchErrors";

import jwt from "jsonwebtoken";

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Request, Response, NextFunction } from "express";

const GOOGLE_CLIENT_ID = envs.PRIVATE_CLIENT_ID || "your-client-id";
const GOOGLE_CLIENT_SECRET = envs.PRIVATE_CLIENT_SECRET || "your-client-secret";
const JWT_SECRET = envs.JWT_KEY || "your-jwt-secret";

export const login = catchErrors(async (req, res) => {
  const { email, password } = req.body;
  const user = await PlayerModel.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    res
      .status(HTTP_RESPONSE_CODE.UNAUTHORIZED)
      .json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { userId: user?._id, role: user?.role },
    envs.JWT_KEY,
    {
      expiresIn: "1h",
    }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: new Date(Date.now() + 3600000), // 1 hour
    path: "/",
    sameSite: "none",
    maxAge: 3600000,
  });
  res.status(HTTP_RESPONSE_CODE.SUCCESS).json({
    token,
    user,
  });
});

export const register = catchErrors(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    res
      .status(HTTP_RESPONSE_CODE.BAD_REQUEST)
      .json({ message: "Please provide all required fields" });
  }

  const user = new PlayerModel({ username, email, password });
  await user.save();
  res
    .status(HTTP_RESPONSE_CODE.CREATED)
    .json({ message: "User registered successfully" });
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
    { id: user.id, email: user.email, role: user.role },
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
    res.cookie("google_jwt", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });
    res.redirect("http://localhost:5173/");
  })(req, res, next);
};
