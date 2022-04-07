/**
@param {string} recipient - phone number
@param {string} text - message body
@param {object} context - additional authorization context
@param {string} context.message_type - 'sms' or 'voice'
@param {string} context.action - 'enrollment' or 'second-factor-authentication'
@param {string} context.language - language used by login flow
@param {string} context.code - one time password
@param {string} context.ip - ip address
@param {string} context.user_agent - user agent making the authentication request
@param {object} context.client - object with details about the Auth0 application
@param {string} context.client.client_id - Auth0 application ID
@param {string} context.client.name - Auth0 application name
@param {object} context.client.client_metadata - metadata from client (optional)
@param {object} context.user - object representing the user
@param {string} context.user.user_id - Auth0 user ID
@param {string} context.user.name - user name
@param {string} context.user.email - user email
@param {object} context.user.app_metadata - metadata specific to user and application
@param {object} context.user.user_metadata - metadata specific to user
@param {function} cb - function (error, response)
*/
const axios = require("axios").default;
const fast_sms = require("fast-two-sms");
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
const updateUserMetadata = async (user_id, phone) => {
  const token = await getAccessToken();
  if (token) {
    return await axios
      .request({
        method: "PATCH",
        url: `<URL_ISSUED_BY_AUTH0>/api/v2/users/${user_id}`,
        data: JSON.stringify({ user_metadata: { phone } }),
        headers: {
          "Content-type": "application/json",
          authorization: token,
        },
      })
      .then(function (response) {
        if (response.data) {
          return true;
        } else {
          return false;
        }
      })
      .catch(function (error) {
        return false;
      });
  } else {
    return false;
  }
};
const getUserVerificationStaus = async (user_id) => {
  return await axios
    .request({
      method: "GET",
      url: `<URL_ISSUED_BY_AUTH0>/api/v2/users/${user_id}`,
      headers: {
        authorization: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Img4SFU5eHU0QjdfS3BCNE1OR2JKZSJ9.eyJpc3MiOiJodHRwczovL2Rldi1vcDEzZ3V3Ni51cy5hdXRoMC5jb20vIiwic3ViIjoiQ2l4RkhOa0NDZzRteWtMMGltWThGN1lyT09nUWEzZ2hAY2xpZW50cyIsImF1ZCI6Imh0dHBzOi8vZGV2LW9wMTNndXc2LnVzLmF1dGgwLmNvbS9hcGkvdjIvIiwiaWF0IjoxNjQ5MTMwODg1LCJleHAiOjE2NDkyMTcyODUsImF6cCI6IkNpeEZITmtDQ2c0bXlrTDBpbVk4RjdZck9PZ1FhM2doIiwic2NvcGUiOiJyZWFkOmNsaWVudF9ncmFudHMgY3JlYXRlOmNsaWVudF9ncmFudHMgZGVsZXRlOmNsaWVudF9ncmFudHMgdXBkYXRlOmNsaWVudF9ncmFudHMgcmVhZDp1c2VycyB1cGRhdGU6dXNlcnMgZGVsZXRlOnVzZXJzIGNyZWF0ZTp1c2VycyByZWFkOnVzZXJzX2FwcF9tZXRhZGF0YSB1cGRhdGU6dXNlcnNfYXBwX21ldGFkYXRhIGRlbGV0ZTp1c2Vyc19hcHBfbWV0YWRhdGEgY3JlYXRlOnVzZXJzX2FwcF9tZXRhZGF0YSByZWFkOnVzZXJfY3VzdG9tX2Jsb2NrcyBjcmVhdGU6dXNlcl9jdXN0b21fYmxvY2tzIGRlbGV0ZTp1c2VyX2N1c3RvbV9ibG9ja3MgY3JlYXRlOnVzZXJfdGlja2V0cyByZWFkOmNsaWVudHMgdXBkYXRlOmNsaWVudHMgZGVsZXRlOmNsaWVudHMgY3JlYXRlOmNsaWVudHMgcmVhZDpjbGllbnRfa2V5cyB1cGRhdGU6Y2xpZW50X2tleXMgZGVsZXRlOmNsaWVudF9rZXlzIGNyZWF0ZTpjbGllbnRfa2V5cyByZWFkOmNvbm5lY3Rpb25zIHVwZGF0ZTpjb25uZWN0aW9ucyBkZWxldGU6Y29ubmVjdGlvbnMgY3JlYXRlOmNvbm5lY3Rpb25zIHJlYWQ6cmVzb3VyY2Vfc2VydmVycyB1cGRhdGU6cmVzb3VyY2Vfc2VydmVycyBkZWxldGU6cmVzb3VyY2Vfc2VydmVycyBjcmVhdGU6cmVzb3VyY2Vfc2VydmVycyByZWFkOmRldmljZV9jcmVkZW50aWFscyB1cGRhdGU6ZGV2aWNlX2NyZWRlbnRpYWxzIGRlbGV0ZTpkZXZpY2VfY3JlZGVudGlhbHMgY3JlYXRlOmRldmljZV9jcmVkZW50aWFscyByZWFkOnJ1bGVzIHVwZGF0ZTpydWxlcyBkZWxldGU6cnVsZXMgY3JlYXRlOnJ1bGVzIHJlYWQ6cnVsZXNfY29uZmlncyB1cGRhdGU6cnVsZXNfY29uZmlncyBkZWxldGU6cnVsZXNfY29uZmlncyByZWFkOmhvb2tzIHVwZGF0ZTpob29rcyBkZWxldGU6aG9va3MgY3JlYXRlOmhvb2tzIHJlYWQ6YWN0aW9ucyB1cGRhdGU6YWN0aW9ucyBkZWxldGU6YWN0aW9ucyBjcmVhdGU6YWN0aW9ucyByZWFkOmVtYWlsX3Byb3ZpZGVyIHVwZGF0ZTplbWFpbF9wcm92aWRlciBkZWxldGU6ZW1haWxfcHJvdmlkZXIgY3JlYXRlOmVtYWlsX3Byb3ZpZGVyIGJsYWNrbGlzdDp0b2tlbnMgcmVhZDpzdGF0cyByZWFkOmluc2lnaHRzIHJlYWQ6dGVuYW50X3NldHRpbmdzIHVwZGF0ZTp0ZW5hbnRfc2V0dGluZ3MgcmVhZDpsb2dzIHJlYWQ6bG9nc191c2VycyByZWFkOnNoaWVsZHMgY3JlYXRlOnNoaWVsZHMgdXBkYXRlOnNoaWVsZHMgZGVsZXRlOnNoaWVsZHMgcmVhZDphbm9tYWx5X2Jsb2NrcyBkZWxldGU6YW5vbWFseV9ibG9ja3MgdXBkYXRlOnRyaWdnZXJzIHJlYWQ6dHJpZ2dlcnMgcmVhZDpncmFudHMgZGVsZXRlOmdyYW50cyByZWFkOmd1YXJkaWFuX2ZhY3RvcnMgdXBkYXRlOmd1YXJkaWFuX2ZhY3RvcnMgcmVhZDpndWFyZGlhbl9lbnJvbGxtZW50cyBkZWxldGU6Z3VhcmRpYW5fZW5yb2xsbWVudHMgY3JlYXRlOmd1YXJkaWFuX2Vucm9sbG1lbnRfdGlja2V0cyByZWFkOnVzZXJfaWRwX3Rva2VucyBjcmVhdGU6cGFzc3dvcmRzX2NoZWNraW5nX2pvYiBkZWxldGU6cGFzc3dvcmRzX2NoZWNraW5nX2pvYiByZWFkOmN1c3RvbV9kb21haW5zIGRlbGV0ZTpjdXN0b21fZG9tYWlucyBjcmVhdGU6Y3VzdG9tX2RvbWFpbnMgdXBkYXRlOmN1c3RvbV9kb21haW5zIHJlYWQ6ZW1haWxfdGVtcGxhdGVzIGNyZWF0ZTplbWFpbF90ZW1wbGF0ZXMgdXBkYXRlOmVtYWlsX3RlbXBsYXRlcyByZWFkOm1mYV9wb2xpY2llcyB1cGRhdGU6bWZhX3BvbGljaWVzIHJlYWQ6cm9sZXMgY3JlYXRlOnJvbGVzIGRlbGV0ZTpyb2xlcyB1cGRhdGU6cm9sZXMgcmVhZDpwcm9tcHRzIHVwZGF0ZTpwcm9tcHRzIHJlYWQ6YnJhbmRpbmcgdXBkYXRlOmJyYW5kaW5nIGRlbGV0ZTpicmFuZGluZyByZWFkOmxvZ19zdHJlYW1zIGNyZWF0ZTpsb2dfc3RyZWFtcyBkZWxldGU6bG9nX3N0cmVhbXMgdXBkYXRlOmxvZ19zdHJlYW1zIGNyZWF0ZTpzaWduaW5nX2tleXMgcmVhZDpzaWduaW5nX2tleXMgdXBkYXRlOnNpZ25pbmdfa2V5cyByZWFkOmxpbWl0cyB1cGRhdGU6bGltaXRzIGNyZWF0ZTpyb2xlX21lbWJlcnMgcmVhZDpyb2xlX21lbWJlcnMgZGVsZXRlOnJvbGVfbWVtYmVycyByZWFkOmVudGl0bGVtZW50cyByZWFkOmF0dGFja19wcm90ZWN0aW9uIHVwZGF0ZTphdHRhY2tfcHJvdGVjdGlvbiByZWFkOm9yZ2FuaXphdGlvbnNfc3VtbWFyeSByZWFkOm9yZ2FuaXphdGlvbnMgdXBkYXRlOm9yZ2FuaXphdGlvbnMgY3JlYXRlOm9yZ2FuaXphdGlvbnMgZGVsZXRlOm9yZ2FuaXphdGlvbnMgY3JlYXRlOm9yZ2FuaXphdGlvbl9tZW1iZXJzIHJlYWQ6b3JnYW5pemF0aW9uX21lbWJlcnMgZGVsZXRlOm9yZ2FuaXphdGlvbl9tZW1iZXJzIGNyZWF0ZTpvcmdhbml6YXRpb25fY29ubmVjdGlvbnMgcmVhZDpvcmdhbml6YXRpb25fY29ubmVjdGlvbnMgdXBkYXRlOm9yZ2FuaXphdGlvbl9jb25uZWN0aW9ucyBkZWxldGU6b3JnYW5pemF0aW9uX2Nvbm5lY3Rpb25zIGNyZWF0ZTpvcmdhbml6YXRpb25fbWVtYmVyX3JvbGVzIHJlYWQ6b3JnYW5pemF0aW9uX21lbWJlcl9yb2xlcyBkZWxldGU6b3JnYW5pemF0aW9uX21lbWJlcl9yb2xlcyBjcmVhdGU6b3JnYW5pemF0aW9uX2ludml0YXRpb25zIHJlYWQ6b3JnYW5pemF0aW9uX2ludml0YXRpb25zIGRlbGV0ZTpvcmdhbml6YXRpb25faW52aXRhdGlvbnMiLCJndHkiOiJjbGllbnQtY3JlZGVudGlhbHMifQ.y4JCO8Qmlphhg7egRMuWZ7jCNpBN_GEzqPkQDX6BwoEXGY814WlvLC8ZfxamfFPmClYhhyrJ0zE04aDJnqYXIFv32OyzAP5cZyESCi8tg4H2bKJZPZvorqmdJ-x0-X_XQ2r9HUyo59of8XybV-Eyc0sFAaMHLHiOGAWtPvOlITh7N2axNBqpGiwMbhLnMJ5ZWB1YgggXjgFs_2gqAf6UN1ddtpqSUkBMTZKN9ThA4_Y2_SBfE1eB43-iW_YDrbQ6-QuP3OVV87PETp4n6btMjLB_ccHwogxPyqtQcJuAJPdOrUdRzFGYscctanMDDlRWFHkxMvByhlvuy-hflbSA8w`,
      },
    })
    .then(function (response) {
      if (response.data && response.data.email_verified) {
        return true;
      } else {
        return false;
      }
    })
    .catch(function (error) {
      console.log("verification error", error);
      return false;
    });
};
module.exports = async function (recipient, text, context, cb) {
  // Configure custom phone message
  const isEmailVerified = await getUserVerificationStaus(context.user.user_id);
  if (isEmailVerified) {
    let options = {
      authorization: "<FAST-TO-SMS-API-KEY>",
      message: `Your OTP is ${context.code}`,
      flash: 1,
      numbers: [recipient.split(" ")[1]],
    };
    await fast_sms.sendMessage(options).then(async (res) => {
      if (res.return) {
        cb(null, {});
        await updateUserMetadata(context.user.user_id, recipient.split(" ")[1]);
      } else {
        cb("Only valid for indian user");
      }
    });
  } else {
    cb("Please Verify your Email Address");
  }
};
