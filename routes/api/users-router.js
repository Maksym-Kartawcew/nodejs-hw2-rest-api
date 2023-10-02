import express from "express";

import * as userSchemas from "../../models/User.js";
import { validateBody } from "../../decorators/decorators.js";

import authController from "../../controllers/users-controller.js";

import { authenticate } from "../../middlewares/middlewares.js";

const usersRouter = express.Router();
const userRegisterValidate = validateBody(userSchemas.userRegisterSchema);
const userLoginValidate = validateBody(userSchemas.userLoginSchema);
const userSubscriptionValidate = validateBody(userSchemas.userSubscriptionSchema); // Додайте схему перевірки підписки


usersRouter.post("/register", userRegisterValidate, authController.register);
usersRouter.post("/login", userLoginValidate, authController.login);
usersRouter.get("/current", authenticate, authController.getCurrent);
usersRouter.post("/logout", authenticate, authController.logout);
usersRouter.patch("/subscription", authenticate, userSubscriptionValidate, authController.updateSubscription);

export default usersRouter;
