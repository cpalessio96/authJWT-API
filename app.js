import "dotenv/config";
import { connect } from "./config/database.js";
import express from "express";

connect();

const app = express();

app.use(express.json());

app.post("/register", async (req, res) => {
  try {
    // todo inserire funzione register
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "error" });
  }
});

export default app;
