import {
  login,
  logout,
  sendProfileInfo,
  signUp,
  updateProfile,
} from "@/controllers/auth";
import { isAuth } from "@/middlewares/auth";
import { fileParser } from "@/middlewares/file";
import { Router } from "express";

const authRouter = Router();

authRouter.post("/signup", signUp);
authRouter.post("/login", login);

authRouter.get("/profile", isAuth, sendProfileInfo);
authRouter.post("/logout", isAuth, logout);
authRouter.put(
  "/profile",
  isAuth,
  fileParser,
  updateProfile
);

export default authRouter;
