import UserModel from "@/models/user";
import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import ActiveSessionModel from "@/models/activeSession";
import { formatUserProfile, sendErrorResponse } from "@/utils/helper";

declare global {
  namespace Express {
    export interface Request {
      user: {
        id: string;
        name?: string;
        email: string;
      
        avatar?: string;
      };
    }
  }
}

export const isAuth: RequestHandler = async (req, res, next) => {
  const authToken = req.cookies.authToken;

  // send error response if there is no token
  if (!authToken) {
    return sendErrorResponse({
      message: "Unauthorized request!",
      status: 401,
      res,
    });
  }

  // otherwise find out if the token is valid or signed by this same server
  const payload = jwt.verify(authToken, process.env.JWT_SECRET!) as {
    userId: string;
    sessionId: string;
  };

  // if the token is valid find user from the payload
  const user = await UserModel.findById(payload.userId);
  if (!user) {
    return sendErrorResponse({
      message: "Unauthorized request user not found!",
      status: 401,
      res,
    });
  }
  
  // check for active session
  const session = await ActiveSessionModel.findOne({ _id: payload.sessionId, user: user._id });
  if (!session) {
    // This session has been invalidated
    res.clearCookie("authToken");
    return sendErrorResponse({
      message: "Session expired. Please log in again.",
      status: 401,
      res,
    });
  }

  req.user = formatUserProfile(user);

  next();
};

