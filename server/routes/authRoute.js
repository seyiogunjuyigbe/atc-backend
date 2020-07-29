const express = require("express");
const authCrl = require("../controllers/AuthController");
const authRoute = express.Router();



authRoute.post("/signup", authCrl.createUser);
authRoute.post("/login", authCrl.login);
authRoute.get("/forgot-password",authCrl.forgotPassword);
authRoute.get("/reset/:userId", authCrl.getReset);
authRoute.put("/reset/:userId", authCrl.postReset);
authRoute.get("/profile/:userId ", authCrl.viewUser);
authRoute.get("/:userId/verify/:token",authCrl.ValidateEmailToken);
authRoute.get("/resend/:email",authCrl.ResendTokenEmail);



module.exports = authRoute;
