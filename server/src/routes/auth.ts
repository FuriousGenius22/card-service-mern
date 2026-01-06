import {
  login,
  logout,
  sendProfileInfo,
  signUp,
  updateProfile,
} from "@/controllers/auth";
import { isAuth } from "@/middlewares/auth";
import { fileParser } from "@/middlewares/file";
import {
  newUserSchema,
  userAuthSchema,
  validate,
} from "@/middlewares/validator";
import { Router } from "express";

const authRouter = Router();

authRouter.post("/signup", validate(userAuthSchema), signUp);
authRouter.post("/login", validate(userAuthSchema), login);

authRouter.get("/profile", isAuth, sendProfileInfo);
authRouter.post("/logout", isAuth, logout);
authRouter.put(
  "/profile",
  isAuth,
  fileParser,
  validate(newUserSchema),
  updateProfile
);

export default authRouter;
