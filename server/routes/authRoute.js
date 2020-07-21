const express = require("express");
const authCrl = require("../controllers/AuthController");
const authRoute = express.Router();

authRoute.post("/auth/signup", authCrl.createUser);
authRoute.post("/auth/login", authCrl.login);
authRoute.post(
  "/auth/forgot-password",
  authCrl.forgotPassword
);
authRoute.get("/auth/reset/:userdId", authCrl.getReset);
authRoute.put("/auth/reset/:userId", authCrl.postReset);
authRoute.get("/auth/:userId", authCrl.viewUser);
authRouter.put(
  "/auth/:id/verify/:token",
  authCrl.ValidateEmailToken
);



module.exports = authRoute;
