const { default: axios } = require("axios");

exports.getLocation = async ({ street, city, State, country, postalcode }) => {
  return await axios
    .get(
      `https://us1.locationiq.com/v1/search.php?key=${process.env.LOCATION_IQ_API_KEY}&format=json&street=${street}&city=${city}&state=${State}&country=${country}&postalcode=${postalcode}`
    )
    .then((response) => {
      if (response.status === 200) {
        return response.data[0];
      } else {
        return { error: "connection error" };
      }
    })
    .catch((err) => {
      return { error: "connection error" };
    });
};
