const axios = require("axios").default;
const getAccessToken = async () => {
  return await axios
    .request({
      method: "POST",
      url: `${process.env.ISSUER_BASE_URL}/oauth/token`,
      headers: { "content-type": "application/json" },
      data: JSON.stringify({
        grant_type: "client_credentials",
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.SECRET,
        audience: `${process.env.ISSUER_BASE_URL}/api/v2/`,
      }),
    })
    .then(function (response) {
      console.log(response.data);
      if (response.data && response.data.token_type)
        return `${response.data.token_type} ${response.data.access_token}`;
      else return false;
    })
    .catch(function (error) {
      console.error(error);
      return false;
    });
};
exports.getAccessToken = getAccessToken;
exports.getUserInfo = async (user_id) => {
  const token = await getAccessToken();
  return await axios
    .request({
      method: "GET",
      url: `${process.env.ISSUER_BASE_URL}/api/v2/users/${user_id}`,
      headers: {
        authorization: token,
      },
    })
    .then(function (response) {
      if (response.data) return response.data;
      else return false;
    })
    .catch(function (error) {
      console.error(error);
      return false;
    });
};
