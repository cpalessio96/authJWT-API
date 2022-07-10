import "dotenv/config";
import mongoose from "mongoose";
import BlackListUser from "../model/blackListUser.js";
import DateToken from "../model/dateToken.js";
import { connect } from "../config/database.js";

connect();

const invalidToken = async () => {
  const type = process.argv[2];
  const value = process.argv[3];
  if (!["date", "user"].includes(type)) {
    console.log("errore: il primo valore deve essere uno tra 'date' e 'user'");
    return;
  }
  if (type === "date") {
    await DateToken.updateOne(
      { name: "lastDateTokenValid" },
      { $set: { expiredTimestamp: value ?? Date.now() } },
      { upsert: true }
    );
    console.log(`inserita data ultimo token valido: ${value ?? Date.now()}`);
    return;
  }
  try {
    await BlackListUser.create({
      email: value,
    });
  } catch (err) {
    if (err.code === 11000) {
      console.log(`Utente ${value} già in blacklist`);
      return;
    }
    console.log(err);
    return;
  }
  console.log(`inserito utente ${value} nella blacklist`);
  return;
};

(async () => {
  const response = await invalidToken();
  mongoose.connection.close();
})();
