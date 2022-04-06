const redux = require("redux");
const necessary = (state = { logindata: {} }, action) => {
  switch (action.type) {
    case "UPDATE_LOGIN_INFO":
      return {
        logindata: {
          ...state.logindata,
          [action.convId]: action.logininfo,
        },
      };
    case "DELETE_LOGIN_INFO":
      const delete_data = Object.entries(state.logindata).filter((value) => {
        let [key, logindata] = value;
        if (key !== action.convId) {
          return true;
        } else {
          return false;
        }
      });
      const update_logindata = {};
      for (let [key, logindata_value] in delete_data) {
        update_logindata[key] = logindata_value;
      }
      return {
        logindata: update_logindata,
      };
  }
};
const store = redux.createStore(necessary);
const getLoginInfo = (convId) => {
  if (store && store.getState()) {
    return store.getState().logindata[convId];
  } else {
    return false;
  }
};
exports.getLoginInfo = getLoginInfo;
exports.store = store;
