import express from "express";

import * as userSchemas from "../../models/User.js";
import { validateBody } from "../../decorators/decorators.js";

import authController from "../../controllers/users-controller.js";

import { authenticate, upload } from "../../middlewares/middlewares.js";

const usersRouter = express.Router();
const userRegisterValidate = validateBody(userSchemas.userRegisterSchema);
const userLoginValidate = validateBody(userSchemas.userLoginSchema);
const userEmailValidate = validateBody(userSchemas.userEmailSchema);
const userSubscriptionValidate = validateBody(
  userSchemas.userSubscriptionSchema
);

usersRouter.post("/register", userRegisterValidate, authController.register);
usersRouter.post("/login", userLoginValidate, authController.login);
usersRouter.get("/current", authenticate, authController.getCurrent);
usersRouter.post("/logout", authenticate, authController.logout);
usersRouter.get("/verify/:verificationCode", authController.verify);
usersRouter.post(
  "/verify",
  userEmailValidate,
  authController.resendVerifyEmail
);
usersRouter.patch(
  "/subscription",
  authenticate,
  userSubscriptionValidate,
  authController.updateSubscription
);
usersRouter.patch(
  "/avatars",
  authenticate,
  upload.single("avatar"),
  authController.updateAvatar
);

export default usersRouter;
