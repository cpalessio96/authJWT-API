/**
 * Funzione per tornare i dati utente
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
