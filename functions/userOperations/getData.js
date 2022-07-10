/**
 * Verifica che l'utente esiste, verifica la password e crea il token.
 * Infine torna il code e l'utente
 * @param {String} param.email
 * @param {String} param.password
 * @returns {Object} code e json
 */
export const getData = async ({ firstName, lastName, email }) => {
  return {
    code: 200,
    json: {
      user: {
        firstName,
        lastName,
        email,
      },
    },
  };
};

export default { getData };
