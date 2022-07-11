import jwt from "jsonwebtoken";
import BlackListUser from "../../model/blackListUser.js";
import { checkCredentials } from "../checkCredentials/helper.js";

/**
 * Ad ogni login viene cancellato, se esiste, l'utente dalla backlist.
 * La blacklist serve all'admin per invalidare il token di un singolo utente
 * che quindi si vedrà scaduta la sessione e sarà costretto a riloggare
 * @param {String} email
 */
const deleteUserFromBacklist = async (email) => {
  await BlackListUser.deleteOne({
    email,
  });
};

/**
 * Verifica che l'utente esiste, verifica la password e crea il token.
 * Infine torna il code e l'utente
 * @param {String} param.email
 * @param {String} param.password
 * @returns {Object} code e json
 */
export const loginUser = async ({ email, password }) => {
  const sanitizedEmail = email?.toLowerCase();
  // Validate user input
  if (!sanitizedEmail || !password) {
    return {
      code: 400,
      json: { message: "all input is required" },
    };
  }

  const { user, success } = await checkCredentials({
    email: sanitizedEmail,
    password,
  });

  if (!success) {
    return {
      code: 400,
      json: { message: "invalid credentials" },
    };
  }

  await deleteUserFromBacklist(sanitizedEmail);

  // Crea il token
  const token = jwt.sign(
    { userId: user._id, email: sanitizedEmail, createdAt: Date.now() },
    process.env.TOKEN_KEY,
    {
      expiresIn: "2h",
    }
  );

  return {
    code: 200,
    json: {
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        token,
      },
    },
  };
};

export default { loginUser };
