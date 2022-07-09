import "dotenv/config";
import { connect } from "./config/database.js";
import express from "express";
import { registerUser } from "./functions/register/registerHelper.js";

connect();

const app = express();

app.use(express.json());

// Register
app.post("/register", async (req, res) => {
  try {
    const { code, json } = await registerUser(req.body);
    res.status(code).json(json);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "error" });
  }
});

export default app;
