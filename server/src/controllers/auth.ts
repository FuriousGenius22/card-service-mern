import { RequestHandler } from "express";
import UserModel from "@/models/user";
import { formatUserProfile, sendErrorResponse } from "@/utils/helper";
import jwt from "jsonwebtoken";
import {
  updateAvatarToAws,
  updateAvatarToCloudinary,
} from "@/utils/fileUpload";
import slugify from "slugify";
import ActiveSessionModel from "@/models/activeSession";

export const sendProfileInfo: RequestHandler = (req, res) => {
  res.json({
    profile: req.user,
  });
};

export const logout: RequestHandler = async (req, res) => {
  const { user } = req;
  const isDevModeOn = process.env.NODE_ENV === "development";

  // remove active session
  await ActiveSessionModel.deleteMany({ user: user.id });

  res
    .clearCookie("authToken", {
      httpOnly: true,
      secure: !isDevModeOn,
      sameSite: isDevModeOn ? "strict" : "none",
      path: "/",
    })
    .send();
};

export const updateProfile: RequestHandler = async (req, res) => {
  const user = await UserModel.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      signedUp: true,
    },
    {
      new: true,
    }
  );

  if (!user)
    return sendErrorResponse({
      res,
      message: "Something went wrong user not found!",
      status: 500,
    });

  // if there is any file upload them to cloud and update the database
  

  res.json({ profile: formatUserProfile(user) });
};

export const signUp: RequestHandler = async (req, res) => {
  const { email, password } = req.body;

  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    return sendErrorResponse({
      status: 409, // Conflict
      message: "Email already exists.",
      res,
    });
  }

  const user = await UserModel.create({ email, password });

  // Create an active session
  const session = await ActiveSessionModel.create({ user: user._id });

  const payload = { userId: user._id, sessionId: session._id };
  const authToken = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "15d",
  });

  const isDevModeOn = process.env.NODE_ENV === "development";
  res.cookie("authToken", authToken, {
    httpOnly: true,
    secure: !isDevModeOn,
    sameSite: isDevModeOn ? "strict" : "none",
    expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
  });

  res.status(201).json({ profile: formatUserProfile(user) });
};

export const login: RequestHandler = async (req, res) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email });

  if (!user) {
    return sendErrorResponse({
      status: 404, // Not Found
      message: "User not found. Please sign up.",
      res,
    });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return sendErrorResponse({
      status: 401, // Unauthorized
      message: "Incorrect password.",
      res,
    });
  }

  // Create an active session
  const session = await ActiveSessionModel.create({ user: user._id });

  const payload = { userId: user._id, sessionId: session._id };
  const authToken = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "15d",
  });

  const isDevModeOn = process.env.NODE_ENV === "development";
  res.cookie("authToken", authToken, {
    httpOnly: true,
    secure: !isDevModeOn,
    sameSite: isDevModeOn ? "strict" : "none",
    expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
  });

  res.json({ profile: formatUserProfile(user) });
};
