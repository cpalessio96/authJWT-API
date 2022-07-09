import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "./model/user.js";

const regexCheckEmail =
  /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

/**
 * Fa il check per verificare che la mail sia valida
 * @param {String} email
 * @returns {Boolean} flag email valida
 */
const validateEmail = (email) => {
  return email.match(regexCheckEmail);
};

/**
 * Presi i dati in input verifica se la richiesta è valida,
 * verifica prima i campi in input e successivamente se l'utente non esiste
 * @param {String} param.firstName
 * @param {String} param.lastName
 * @param {String} param.email
 * @param {String} param.password
 * @returns {Object}
 */
const validateRequest = async ({ firstName, lastName, email, password }) => {
  if (!(validateEmail(email) && password && firstName && lastName)) {
    return {
      success: false,
      code: 400,
      message: "Bad request: invalid input",
    };
  }

  const oldUser = await User.findOne({ email });

  if (oldUser) {
    return {
      success: false,
      code: 409,
      message: "User already exists",
    };
  }

  return {
    success: true,
  };
};

/**
 * Salva l'utente, crea il token e torna l'oggetto utente contente anche il token
 * Crea l'utente con il ruolo di default: "member"
 *
 * @param {String} firstName
 * @param {String} lastName
 * @param {String} email
 * @param {String} password
 * @returns {Object}
 */
const saveUser = async (firstName, lastName, email, password) => {
  // encrypt password utente
  const encryptedPassword = await bcrypt.hash(password, 10);

  // Creazione utente
  const user = await User.create({
    firstName,
    lastName,
    email: sanitizedEmail,
    password: encryptedPassword,
    role: "member", // questo è il ruolo di default
  });

  // Creazione token
  const token = jwt.sign({ user_id: user._id, email }, process.env.TOKEN_KEY, {
    expiresIn: "2h",
  });

  return {
    ...user,
    token,
  };
};

/**
 * funzione per la registrazione dell'utente
 * @param {String} firstName
 * @param {String} lastName
 * @param {String} email
 * @param {String} password
 * @returns {Object}
 */
const registerUser = async (firstName, lastName, email, password) => {
  const sanitizedEmail = String(email).toLowerCase();

  const { success, code, message } = await validateRequest({
    firstName,
    lastName,
    email: sanitizedEmail,
    password,
  });

  if (!success) {
    return {
      code,
      json: { message },
    };
  }

  const user = await saveUser();

  return {
    code: 201,
    json: user,
  };
};

export default { registerUser };
