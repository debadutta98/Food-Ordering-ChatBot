/**
@param {object} user - The user being created
@param {string} user.tenant - Auth0 tenant name
@param {string} user.username - user name
@param {string} user.password - user's password
@param {string} user.email - email
@param {boolean} user.emailVerified - is e-mail verified?
@param {string} user.phoneNumber - phone number
@param {boolean} user.phoneNumberVerified - is phone number verified?
@param {object} context - Auth0 connection and other context info
@param {string} context.renderlanguage - language used by signup flow
@param {string} context.request.ip - ip address
@param {string} context.request.language - language of the client agent
@param {object} context.connection - information about the Auth0 connection
@param {object} context.connection.id - connection id
@param {object} context.connection.name - connection name
@param {object} context.connection.tenant - connection tenant
@param {object} context.webtask - webtask context
@param {function} cb - function (error, response)
*/
const axios = require("axios").default;
const getAccessToken = async () => {
  return await axios
    .request({
      method: "POST",
      url: "<URL_ISSUED_BY_AUTH0>",
      headers: { "content-type": "application/json" },
      data: JSON.stringify({
        grant_type: "client_credentials",
        client_id: "<CLIENT_ID_ISSUED_BY_AUTH0>",
        client_secret: "<CLIENT_SECRET_ISSUED_BY_AUTH0>",
        audience: `<URL_ISSUED_BY_AUTH0>/api/v2/`,
      }),
    })
    .then(function (response) {
      if (response.data && response.data.token_type)
        return `${response.data.token_type} ${response.data.access_token}`;
      else return false;
    })
    .catch(function (error) {
      return false;
    });
};
const findUserByEmail = async (email) => {
  const token = await getAccessToken();
  if (token) {
    return await axios
      .request({
        method: "GET",
        url: "<URL_ISSUED_BY_AUTH0>/api/v2/users-by-email",
        params: { email },
        headers: { authorization: token },
      })
      .then(function (response) {
        if (
          response.data &&
          Array.isArray(response.data) &&
          response.data.length > 0
        ) {
          if (response.data[0].email === email) {
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      })
      .catch(function (error) {
        return undefined;
      });
  } else {
    return undefined;
  }
};
module.exports = async function (user, context, cb) {
  var response = {};

  response.user = user;
  const is_Email_Present = await findUserByEmail(user.email);
  if (is_Email_Present === undefined) {
    return cb(
      new PreUserRegistrationError(
        "Denied user registration in Pre User Registration Hook",
        "500 Internal Server Error Please Try again later"
      )
    );
  } else if (is_Email_Present) {
    return cb(
      new PreUserRegistrationError(
        "Denied user registration in Pre User Registration Hook",
        "User is already Exit"
      )
    );
  } else {
    cb(null, response);
  }
  // Add user or app metadata to the newly created user
  // response.user.user_metadata = { foo: 'bar' };
  // response.user.app_metadata = { vip: true, score: 7 };

  // Deny the user's registration and send a localized message to New Universal Login
  // if (denyRegistration) {
  //    const LOCALIZED_MESSAGES = {
  //      en: 'You are not allowed to register.',
  //      es: 'No tienes permitido registrarte.'
  //    };
  //
  //    const localizedMessage = LOCALIZED_MESSAGES[context.renderLanguage] || LOCALIZED_MESSAGES['en'];
  //    return cb(new PreUserRegistrationError('Denied user registration in Pre User Registration Hook', localizedMessage));
  // }
};
