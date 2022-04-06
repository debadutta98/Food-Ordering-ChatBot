exports.Constant = {
  LuisErrorMessage: "Sorry i can't understand",
  dialogIds: {
    rootDialogID: "ROOT_DIALOG",
    authenticationDialogId: "AUTHENTICATION_DIALOG",
    authenticationChildDialogids: {
      signinDialog: "SIGNIN_DIALOG",
      signupDialog: "signupDialog",
    },
    mealsCategroiesId: "MEALS_CATEGROIES_DIALOG",
    orderProcessing: "ORDER_PROCESS_DIALOG",
    addressDialogId: "ADDRESS_DIALOG",
    cuisinesDialogId: "CUISINES_DIALOG",
    cartDialogId: "CART_DIALOG",
    paymentDialogId: "PAYMENT_DIALOG",
    reviewDialogId: "REVIEW_DIALOG",
    myorderDialogId: "MYORDER_DIALOG",
    reviewDialogId: "REVIEW_DIALOG",
  },
  images: {
    chief:
      "https://i.pinimg.com/736x/03/55/19/0355196bc9ea5aaa4e07e1802673c3af.jpg",
    foodie:
      "https://www.wyo.in/pub/media/mf_webp/png//pub/media/catalog/tmp/category/Foodie.webp",
    foodiequotes:
      "https://img.freepik.com/free-vector/hand-drawn-food-lettering-poster-cafe-restaurant_8596-242.jpg",
    button_icon: {
      login: "https://cdn-icons-png.flaticon.com/512/3580/3580168.png",
      verify:
        "https://img.icons8.com/external-tal-revivo-bold-tal-revivo/344/external-approved-checkmark-symbol-to-verify-the-result-basic-bold-tal-revivo.png",
    },
    address_type_icon: {
      home: "https://img.icons8.com/bubbles/344/home.png",
      work: "https://img.icons8.com/external-flatart-icons-flat-flatarticons/344/external-work-time-work-from-home-flatart-icons-flat-flatarticons.png",
      other: "https://img.icons8.com/office/344/home--v1.png",
    },
  },
  Menus: [
    "Meals Categories",
    "Cuisines",
    "Cart",
    "Address",
    "My Orders",
    "Reviews",
  ],
  AddressOperations: [
    "Add new address",
    "Show all address",
    "Delete address",
    "Change Delivery address",
  ],
  OrdersCatagories: ["Pending Orders", "Successful Orders", "Canceled Order"],
  PromptIDs: [
    "CONFIRM_PROMPT",
    "CONFIRM_PROMPT",
    "CHOICE_PROMPT",
    "CONFIRM_PROMPT_CART",
    "CHOICE_PROMPT_CUISINES",
    "NUMBER_PROMPT_CUISINES",
    "NUMBER_PROMPT_MEALS_CATEGORIES",
    "CONFIRM_PROMPT_MYORDER",
    "CONFIRM_PROMPT_MYORDER",
  ],
};
