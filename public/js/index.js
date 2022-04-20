// const styleOptions = {
//   backgroundColor: "Black",
//   bubbleBackground: "#222",
//   bubbleBorder: "solid 1px #444",
//   bubbleBorderRadius: 20,
//   bubbleFromUserBackground: "#222",
//   bubbleFromUserBorder: "solid 1px #444",
//   bubbleFromUserBorderRadius: 20,
//   bubbleFromUserTextColor: "White",
//   bubbleTextColor: "White",
// };

function validURL(string) {
  try {
    let url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (err) {
    return false;
  }
}
const ratings = (rate) => {
  let result = "";
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.round(rate)) {
      result += "★";
    } else {
      result += "☆";
    }
  }
  return result;
};

let interval1;
let interval2;
function disableInputs(toggle) {
  if (toggle) {
    document.querySelector(".webchat__send-box-text-box__input").disabled =
      toggle;
    document.querySelector(".webchat__send-box__button").disabled = toggle;
    interval1 = setInterval(() => {
      document.querySelector(".webchat__send-box-text-box__input").disabled =
        toggle;
      document.querySelector(".webchat__send-box__button").disabled = toggle;
      document.querySelector(".webchat__send-box-text-box__input").placeholder =
        "Please Wait";
    }, 1500);
    interval2 = setInterval(() => {
      document.querySelector(".webchat__send-box-text-box__input").disabled =
        toggle;
      document.querySelector(".webchat__send-box__button").disabled = toggle;
      document.querySelector(
        ".webchat__send-box-text-box__input"
      ).placeholder += ".";
    }, 500);
  } else {
    if (interval1) {
      clearInterval(interval1);
      clearInterval(interval2);
      interval1 = undefined;
      interval2 = undefined;
    }
    document.querySelector(".webchat__send-box-text-box__input").disabled =
      toggle;
    document.querySelector(".webchat__send-box__button").disabled = toggle;
    document.querySelector(".webchat__send-box-text-box__input").placeholder =
      "Type your message";
  }
}
function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  // new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  let expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
function getCookie(cname) {
  let name = cname + "=";
  let ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}
let useravatar = getCookie("profile_image");
const avatarOptions = {
  botAvatarImage: "https://img.icons8.com/color/344/online-support.png",
  botAvatarInitials: "BOT",
  userAvatarImage:
    useravatar && useravatar !== ""
      ? JSON.parse(decodeURIComponent(useravatar)).profile_img
      : "https://cdn-icons-png.flaticon.com/512/1177/1177568.png",
  userAvatarInitials: "YOU",
  hideUploadButton: true,
};
// In this demo, we are showing how to initialize Web Chat with a secret. This is NOT RECOMMENDED for deployed bots.
// Your client code must provide either a secret or a token to talk to your bot.
// Tokens are more secure. To learn about the differences between secrets and tokens
// and to understand the risks associated with using secrets, visit https://docs.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-direct-line-3-0-authentication?view=azure-bot-service-4.0

// The code commented out below exemplifies how to implement the same page while fetching a token from your own token server.

// const res = await fetch('https:YOUR_TOKEN_SERVER.NET/API', { method: 'POST' });
// const { token } = await res.json();
const styleSet = window.WebChat.createStyleSet({
  bubbleBackground: "rgba(0, 0, 255, .1)",
  bubbleFromUserBackground: "rgba(0, 255, 0, .1)",
  rootHeight: "100%",
  rootWidth: "50%",
  backgroundColor: "paleturquoise",
});
styleSet.textContent = {
  ...styleSet.textContent,
  fontFamily: "'Comic Sans MS', 'Arial', sans-serif",
  fontWeight: "bold",
};
const store = window.WebChat.createStore(
  {},
  ({ dispatch }) =>
    (next) =>
    (action) => {
      console.log(action.type);
      if (action.type === "DIRECT_LINE/INCOMING_ACTIVITY") {
        if (
          action.payload.activity.value &&
          action.payload.activity.value.button !== "review" &&
          action.payload.activity.value.button !== "submit_review" &&
          action.payload.activity.value.prompt !== "continue"
        ) {
          let dom = document.querySelectorAll(".ac-adaptiveCard");
          if (dom.length > 0) {
            dom.forEach((element) => {
              element.style.pointerEvents = "none";
            });
          }
          let carousel = document.querySelector(
            ".webchat__carousel-filmstrip__attachments"
          );
          if (carousel) {
            carousel.style.pointerEvents = "none";
          }
        }
        const event = new Event("webchatincomingactivity");
        if (
          typeof action.payload.activity.value === "string" &&
          validURL(action.payload.activity.value)
        ) {
          localStorage.setItem(
            "navigate-to",
            encodeURIComponent(action.payload.activity.value)
          );
        }
        event.data = { payload: action.payload.activity, dispatch };
        window.dispatchEvent(event);
      } else if (
        action.type === "DIRECT_LINE/POST_ACTIVITY_FULFILLED" ||
        action.type === "WEB_CHAT/SET_SUGGESTED_ACTIONS"
      ) {
        let navigate = document.querySelectorAll("button[role='link']");
        if (navigate) {
          navigate.forEach((link) => {
            link.addEventListener(
              "click",
              (e) => {
                e.stopImmediatePropagation();
                e.stopPropagation();
                e.preventDefault();
                if (
                  localStorage.getItem("navigate-to") &&
                  validURL(
                    decodeURIComponent(localStorage.getItem("navigate-to"))
                  )
                ) {
                  let left = (screen.width - 600) / 2;
                  let top = (screen.height - 600) / 4;
                  let userwindow = window.open(
                    decodeURIComponent(localStorage.getItem("navigate-to")),
                    "popup",
                    `height=600px,width=600px,resizable=1,scrollbars=1,left=${left},top=${top}`
                  );
                  userwindow.focus();
                  userwindow.addEventListener("load", () => {
                    disableInputs(true);
                  });
                  userwindow.addEventListener('unload',()=>{
                     disableInputs(false);
                  });
                }
              },
              true
            );
          });
        }
      } else if (action.type === "DIRECT_LINE/CONNECTION_STATUS_UPDATE") {
        document.querySelector(".dropdown-backdrop").style.display = "none";
        document.querySelector(".loading-container").style.display = "none";
        document.querySelector("#webchat").style.zIndex = "0";
        let messageBox = document.querySelector(
          ".webchat__send-box-text-box__input"
        );
        messageBox.setAttribute("list", "message-suggesstions");
        messageBox.setAttribute("name", "messageBox");
        let datalist = document.createElement(`datalist`);
        datalist.setAttribute("id", "message-suggesstions");
        datalist.innerHTML = `<option value="Hi"><small>To initiate Conversation<small></option>
      <option value="Home"><small>Redireact to main menu<small></option>
      <option value="Review"><small>To see Product Review</small></option>
      <option value="Address"><small>To see Address Information</small></option>`;
        messageBox.after(datalist);
      }
      return next(action);
    }
);
const cardActionMiddleware =
  ({ dispatch }) =>
  (next) =>
  (action) => {
    const {
      cardAction: { type, value },
    } = action;
    if (type === "openUrl") {
      disableInputs(true);
    } else if (
      (type === "postBack" &&
        value.button !== "review" &&
        value.button !== "submit_review") ||
      type === "imBack" ||
      type === "messageBack"
    ) {
      let dom = document.querySelectorAll(".ac-adaptiveCard");
      if (dom.length > 0) {
        dom.forEach((element) => {
          element.style.pointerEvents = "none";
        });
      }
      let carousel = document.querySelector(
        ".webchat__carousel-filmstrip__attachments"
      );
      if (carousel) {
        carousel.style.pointerEvents = "none";
      }
    }
    return next(action);
  };
const renderChat = (token, username, userid) => {
  window.WebChat.renderWebChat(
    {
      directLine: window.WebChat.createDirectLine({ token }),
      userID: userid,
      username,
      locale: "en-us",
      styleSet,
      store,
      cardActionMiddleware,
      styleOptions: avatarOptions,
    },
    document.getElementById("webchat")
  );
};

window.addEventListener("webchatincomingactivity", ({ data }) => {
  console.log(["activity type"], data.payload.type);
  if (
    data.payload.type === "message" &&
    data.payload.value &&
    data.payload.value.code === "3001"
  ) {
    data.dispatch({
      type: "WEB_CHAT/SEND_MESSAGE_BACK",
      payload: {
        name: "webchat/message",
        text: "",
        value: {
          tag: "ADDED_EXTERNALLY",
          isAdded: data.payload.value.isAdded,
        },
      },
    });
  }
  if (
    data.payload.type === "message" &&
    data.payload.value &&
    data.payload.value.code === "3010"
  ) {
    data.dispatch({
      type: "WEB_CHAT/SEND_MESSAGE_BACK",
      payload: {
        name: "webchat/message",
        text: "",
        value: {
          status: data.payload.value.status,
          orderid: data.payload.value.orderid,
        },
      },
    });
  }
  if (
    data.payload.type === "message" &&
    data.payload.value &&
    data.payload.value.code === "3657"
  ) {
    let left = (screen.width - 600) / 2;
    let top = (screen.height - 600) / 4;
    let userwindow = window.open(
      data.payload.value.url,
      "popup",
      `height=600px,width=600px,resizable=1,scrollbars=1,left=${left},top=${top},toolbar=1`
    );
    userwindow.focus();
  }
  if (
    data.payload.type === "message" &&
    data.payload.value &&
    data.payload.value.code === "4099"
  ) {
    data.dispatch({
      type: "WEB_CHAT/SEND_MESSAGE_BACK",
      payload: {
        name: "webchat/message",
        text: "",
        value: {
          error: data.payload.value.error,
          message: data.payload.value.message,
          order_id: data.payload.value.order_id,
        },
      },
    });
  }
  if (
    data.payload.type === "message" &&
    data.payload.value &&
    data.payload.value.code === "4096"
  ) {
    let left = (screen.width - 600) / 2;
    let top = (screen.height - 600) / 4;
    let userwindow = window.open(
      data.payload.value.url,
      "popup",
      `height=600px,width=600px,resizable=1,scrollbars=1,left=${left},top=${top}`
    );
    userwindow.focus();
    userwindow.addEventListener("load", () => {
      disableInputs(true);
    });
  }
  if (
    data.payload.type === "message" &&
    data.payload.value &&
    data.payload.value.code === "5980"
  ) {
    let left = (screen.width - 600) / 2;
    let top = (screen.height - 600) / 4;
    let userwindow = window.open(
      data.payload.value.url,
      "popup",
      `height=600px,width=600px,resizable=1,scrollbars=1,left=${left},top=${top}`
    );
    userwindow.focus();
    userwindow.addEventListener("load", () => {
      disableInputs(true);
    });
    userwindow.addEventListener("unload", () => {
      if (userwindow.document.title === "Successfully Logedin") {
        let chathistory = document.querySelector(
          ".webchat__basic-transcript__transcript"
        );
        if (chathistory) {
          chathistory.innerHTML = "";
        }
        data.dispatch({
          type: "WEB_CHAT/SEND_EVENT",
          payload: {
            name: "webchat/welcome",
          },
        });
        disableInputs(false);
      } else {
        disableInputs(false);
      }
    });
  }
  if (
    data.payload.type === "message" &&
    data.payload.value &&
    data.payload.value.code === "5981"
  ) {
    let left = (screen.width - 600) / 2;
    let top = (screen.height - 600) / 4;
    let userwindow = window.open(
      data.payload.value.url,
      "popup",
      `height=600px,width=600px,resizable=1,scrollbars=1,left=${left},top=${top}`
    );
    userwindow.addEventListener("load", () => {
      disableInputs(true);
    });
    userwindow.focus();
    userwindow.addEventListener("unload", () => {
      if (userwindow.document.title === "Logout Successfully") {
        let chathistory = document.querySelector(
          ".webchat__basic-transcript__transcript"
        );
        if (chathistory) {
          chathistory.innerHTML = "";
        }
        data.dispatch({
          type: "WEB_CHAT/SEND_EVENT",
          payload: {
            name: "webchat/logout",
            value: { message: "You are logged out successfully" },
          },
        });
        disableInputs(false);
      } else {
        disableInputs(false);
      }
    });
  }
  if (
    data.payload.type === "message" &&
    data.payload.value &&
    data.payload.value.code === "5987"
  ) {
    let chathistory = document.querySelector(
      ".webchat__basic-transcript__transcript"
    );
    if (chathistory) {
      chathistory.innerHTML = "";
    }
    data.dispatch({
      type: "WEB_CHAT/SEND_EVENT",
      payload: {
        name: "webchat/welcome",
      },
    });
    disableInputs(false);
  }
  setTimeout(() => {
    disableInputs(false);
  }, 1000);
});
const generateToken = async () => {
  await fetch(`${location.href}createtoken`, {
    method: "POST",
    credentials: "include",
  }).then(async (res) => {
    if (res.status === 201) {
      let { token, conversationId, name } = await res.json();
      setCookie(
        "chattoken",
        encodeURIComponent(JSON.stringify({ conversationId, name })),
        2
      );
      renderChat(token, name, conversationId);
    }
  });
};

let clear = setInterval(() => {
  let direactlineToken = getCookie("chattoken");
  if (!direactlineToken || direactlineToken === "") {
    window.open(location.href, "_self");
    clearInterval(clear);
  }
  window.focus();
}, 2000);
generateToken();
