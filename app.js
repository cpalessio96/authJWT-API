import "dotenv/config";
import { connect } from "./config/database.js";
import express from "express";
import auth from "./middleware/auth.js";
import { registerUser } from "./functions/register/registerHelper.js";
import { loginUser } from "./functions/login/loginHelper.js";
import { getData } from "./functions/userOperations/getData.js";
import { changePassword } from "./functions/userOperations/changePassword.js";

connect();

const app = express();

app.use(express.json());

// Register
app.post("/register", async (req, res) => {
  try {
    const { code, json } = await registerUser(req.body);
    console.log({ code, json });
    res.status(code).json(json);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "error" });
  }
});

// Login
app.post("/login", async (req, res) => {
  try {
    const { code, json } = await loginUser(req.body);
    res.status(code).json(json);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "error" });
  }
});

app.get("/getdata", auth, async (req, res) => {
  try {
    const { code, json } = await getData(req.user);
    res.status(code).json(json);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "error" });
  }
});

app.post("/changepassword", auth, async (req, res) => {
  try {
    const { code, json } = await changePassword({ ...req.user, ...req.body });
    res.status(code).json(json);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "error" });
  }
});

export default app;
