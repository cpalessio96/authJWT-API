import bcrypt from "bcryptjs";
import User from "../../model/user.js";
import { checkCredentials } from "../checkCredentials/helper.js";

/**
 * Verifica che l'utente esiste, verifica la password e crea il token.
 * Infine torna il code e l'utente
 * @param {String} param.email
 * @param {String} param.password
 * @returns {Object} code e json
 */
export const changePassword = async ({ email, newPassword, oldPassword }) => {
  const sanitizedEmail = email?.toLowerCase();
  // Validate user input
  if (!sanitizedEmail || !newPassword || !oldPassword) {
    return {
      code: 400,
      json: { message: "all input is required" },
    };
  }

  const { success } = await checkCredentials({
    email: sanitizedEmail,
    password: oldPassword,
  });

  if (!success) {
    return {
      code: 400,
      json: { message: "invalid credentials" },
    };
  }

  // encrypt password utente
  const encryptedNewPassword = await bcrypt.hash(newPassword, 10);

  await User.updateOne(
    { email: sanitizedEmail },
    { $set: { password: encryptedNewPassword } }
  );

  return {
    code: 200,
    json: {
      success: true,
    },
  };
};

export default { changePassword };
