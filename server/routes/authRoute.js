const express = require("express");
const authCrl = require("../controllers/AuthController");
const authRoute = express.Router();

authRoute.post("/auth/signup", AuthControllers.createUser);
authRoute.post("/auth/login", AuthControllers.login);
authRoute.post(
  "/auth/forgot-password",
  AuthControllers.forgotPassword
);
authRoute.get("/auth/reset/:userdId", AuthControllers.getReset);
authRoute.put("/auth/reset/:userId", AuthControllers.postReset);
authRoute.get("/auth/:userId", AuthControllers.viewCompany);



module.exports = authRoute;
