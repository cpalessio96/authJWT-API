import jwt from "jsonwebtoken";
import DateToken from "../model/dateToken.js";
import User from "../model/user.js";
import BlackListUser from "../model/blackListUser.js";
import { operationByRoles } from "../operationAndPrivileges/roles.js";

const config = process.env;

/**
 * Recupera dal database la data inserita da admin per invalidare tutti i token
 * creati precedentemente e verifica se l'utente esiste in black list
 * @param {String} param.email email utente presa dal token
 * @param {String} param.createdAt timestamp in millisecondi
 * @returns {Boolean} flag expired token
 */
const checkExpiredToken = async ({ email, createdAt }) => {
  const dateToken = await DateToken.findOne({
    name: "lastDateTokenValid",
  });
  const userInvalidate = await BlackListUser.findOne({
    email,
  });
  const expired = dateToken && dateToken.expiredTimestamp > createdAt;
  const blackListed = !!userInvalidate;
  return expired || blackListed;
};

/**
 * Dati il ruolo e il path verifica se l'utente ha i permessi per effettuare l'azione richiesta
 * @param {String} param.role ruolo utente preso dal db
 * @param {String} param.path path richiesta
 * @returns {Boolean} flag allowAction
 */
const checkPermission = ({ role, path }) => {
  const action = path?.split("/")?.[1]?.toLowerCase() ?? "";
  const isPresentRole = Object.keys(operationByRoles).includes(role);
  const allowAction = isPresentRole && operationByRoles[role].includes(action);
  return allowAction;
};

/**
 * Verifica la validità del token, se il token è scaduto o se l'utente è stato messoin black list.
 * Infine verifica anche che l'utente abbia i permessi per effettuare l'azione
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 * @returns {Object}
 */
const verifyToken = async (req, res, next) => {
  const token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    const decoded = jwt.verify(token, config.TOKEN_KEY);
    const { createdAt } = decoded;

    const expiredToken = await checkExpiredToken({
      email: decoded.email,
      createdAt,
    });

    if (expiredToken) {
      return res.status(401).send("Session expired, please login");
    }

    const user = await User.findOne({ _id: decoded.userId });
    const allowAction = checkPermission({
      role: user?.role ?? "",
      path: req.url,
    });

    if (!allowAction) {
      return res.status(403).send("Forbidden: permission denied");
    }

    req.user = user;
  } catch (err) {
    console.log(err);
    return res.status(401).send("Invalid Token");
  }
  return next();
};

export default verifyToken;
