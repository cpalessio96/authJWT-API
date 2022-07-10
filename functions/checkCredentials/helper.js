import User from "../../model/user.js";
import bcrypt from "bcryptjs";

/**
 * Recupera l'utente dal database e verifica le credenziali
 * @param {String} param.email
 * @param {String} param.password
 * @returns {Object} success, user
 */
export const checkCredentials = async ({ email, password }) => {
  const user = await User.findOne({ email });
  let isValidPassword = false;
  if (user) {
    isValidPassword = await bcrypt.compare(password, user?.password);
  }

  if (!user || !isValidPassword) {
    return {
      user: null,
      success: false,
    };
  }

  return {
    success: true,
    user,
  };
};
