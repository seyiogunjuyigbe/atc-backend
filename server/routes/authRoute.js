const express = require("express");
const authCrl = require("../controllers/AuthController");
const authRoute = express.Router();



authRoute.post("/auth/signup", authCrl.createUser);
authRoute.post("/auth/login", authCrl.login);
authRoute.post("/auth/forgot-password",authCrl.forgotPassword);
authRoute.get("/auth/reset/:userId", authCrl.getReset);
authRoute.put("/auth/reset/:userId", authCrl.postReset);
authRoute.get("/auth/profile/:userId ", authCrl.viewUser);
authRoute.get("/auth/:id/verify/:token",authCrl.ValidateEmailToken);
authRoute.get("auth/resend/:email",authCrl.ResendTokenEmail);



module.exports = authRoute;
