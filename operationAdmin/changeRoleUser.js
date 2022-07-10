import "dotenv/config";
import mongoose from "mongoose";
import User from "../model/user.js";
import { connect } from "../config/database.js";

connect();

const changeRoleUser = async () => {
  const email = process.argv[2];
  const role = process.argv[3];

  await User.updateOne({ email }, { $set: { role } });
  console.log(`ruolo: ${role} dell' utente: ${email} aggiornato con successo`);
  return;
};

(async () => {
  const response = await changeRoleUser();
  mongoose.connection.close();
})();
