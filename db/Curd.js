const admin = require("firebase-admin");
let serviceAccount = require("../helper/ServiceAccountKey.json");
const { compareTime, compareTypeOfDates } = require("../helper/utility");
const moment = require("moment");
const naoid = require("nanoid");
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://react-practice-9211b-default-rtdb.firebaseio.com",
  });
}
let db = admin.database();

exports.addAddressDetails = async (userid, address) => {
  let ref = db.ref(`${userid}/addresses`);
  return await ref
    .get()
    .then(async (data) => {
      if (data.exists()) {
        const addresses = data.exportVal();
        let present = false;
        for (let value of Object.values(addresses)) {
          if (
            value.latitude === address.latitude &&
            value.longitude === address.longitude
          ) {
            present = true;
            return true;
          }
        }
        if (!present) {
          for (let [key, value] of Object.entries(addresses)) {
            if (value.default) {
              await ref.child(key).update({ default: false });
            }
          }
          await ref.push(address);
          return true;
        }
      } else {
        await ref.push(address);
        return true;
      }
    })
    .catch((err) => {
      console.log(err);
      return false;
    });
};
exports.getallAddress = async (userid) => {
  let ref = db.ref(`${userid}/addresses`);
  try {
    const data = await ref.get();
    return data.exists() ? data.exportVal() : false;
  } catch (err) {
    return false;
  }
};
exports.deleteUserAddress = async (userid, addressid) => {
  let ref = db.ref(`${userid}/addresses/${addressid}`);
  return ref
    .remove()
    .then((data) => {
      if (data.exists()) {
        return true;
      } else {
        return false;
      }
    })
    .catch((err) => {
      return false;
    });
};
exports.setDeliveryAddress = async (userid, addressid) => {
  let ref = db.ref(`${userid}/addresses`);
  return await ref
    .get()
    .then(async (data) => {
      if (data.exists()) {
        for (let key of Object.keys(data.exportVal())) {
          if (key === addressid) {
            await ref.child(addressid).update({ default: true });
          } else {
            await ref.child(key).update({ default: false });
          }
        }

        return true;
      } else {
        return false;
      }
    })
    .catch((err) => {
      return false;
    });
};
exports.getAddressDetails = async (userid, addressid) => {
  let ref = db.ref(`${userid}/addresses/${addressid}`);
  return ref
    .get()
    .then((data) => {
      if (data.exists()) {
        return data.exportVal().single_address;
      } else {
        return false;
      }
    })
    .catch((err) => false);
};
exports.addItemToCart = async (userid, item) => {
  const ref = db.ref(`${userid}/cart`);
  return await ref
    .get()
    .then(async (data) => {
      if (data.exists()) {
        const allrecords = data.exportVal();
        for (let [key, value] of Object.entries(allrecords)) {
          if (value.mealid === item.mealid) {
            await ref.child(key).update(item);
            return true;
          }
        }
        return await ref
          .push(item)
          .then((data) => {
            if (data) {
              return true;
            } else {
              return false;
            }
          })
          .catch((err) => {
            console.log(err);
            return false;
          });
      } else {
        return await ref
          .push(item)
          .then((data) => {
            if (data) {
              return true;
            } else {
              return false;
            }
          })
          .catch((err) => {
            console.log(err);
            return false;
          });
      }
    })
    .catch((err) => {
      console.log(err);
      return false;
    });
};
exports.getAllCartItem = async (userid) => {
  const ref = db.ref(`${userid}/cart`);
  return await ref
    .get()
    .then((data) => {
      if (data.exists()) {
        return {
          code: true,
          data: data.exportVal(),
          items: Object.keys(data.exportVal()).length,
        };
      } else {
        return { code: false, message: "Your cart is empty" };
      }
    })
    .catch((err) => {
      return {
        code: false,
        message:
          "Due to some we couldn't able to fetch your cart detailsPlease try again",
      };
    });
};
exports.deleteCartItem = async (userid, itemid) => {
  const ref = db.ref(`${userid}/cart/${itemid}`);
  return await ref
    .remove()
    .then((data) => {
      return true;
    })
    .catch((err) => {
      console.log(err);
      return false;
    });
};
exports.getDefaultAddress = async (userid) => {
  let ref = db.ref(`${userid}/addresses`);
  return await ref
    .get()
    .then((data) => {
      if (data.exists()) {
        let address = data.exportVal();
        for (let [key, value] of Object.entries(address)) {
          if (value.default) {
            return { key, single_address: value.single_address };
          }
        }
      } else {
        return false;
      }
    })
    .catch((err) => {
      return false;
    });
};
exports.addnewOrder = async (userid, orderid, orderdetails) => {
  const ref = db.ref(`${userid}/orders/${orderid}`);
  return await ref
    .get()
    .then(async (data) => {
      if (data.exists()) {
        return true;
      } else {
        return await ref
          .set(orderdetails)
          .then((data) => {
            return true;
          })
          .catch((err) => {
            console.log(err);
            return false;
          });
      }
    })
    .catch((err) => {
      console.log(err);
      return false;
    });
};
exports.updateOrder = async (userid, orderid, body) => {
  const ref = db.ref(`${userid}/orders/${orderid}`);
  await ref.update(body);
};
exports.getOrderDetails = async (userid, orderid) => {
  const ref = db.ref(`${userid}/orders/${orderid}`);
  return await ref
    .get()
    .then((data) => data.exportVal())
    .catch((err) => err);
};
exports.addconversationId = async (userid, convid) => {
  const ref = db.ref(`${userid}/conversation`);
  return await ref
    .set({ conversationId: convid })
    .then((data) => true)
    .catch((err) => {
      console.log(err);
      return false;
    });
};
exports.getConversationReferenceId = async (userid) => {
  const ref = db.ref(`${userid}/conversation/conversationId`);
  return await ref
    .get()
    .then((data) => {
      if (data.exists()) {
        return data.exportVal();
      } else {
        return false;
      }
    })
    .catch((err) => {
      console.log(err);
      return false;
    });
};
exports.findUser = async (userid) => {
  const ref = db.ref(userid);
  return await ref
    .get()
    .then((data) => data.exists())
    .catch((err) => false);
};
exports.getLatestSuccessfulOrders = async (userid, status) => {
  const ref = db.ref(`${userid}/orders`);
  return await ref
    .get()
    .then((data) => {
      if (data.exists()) {
        let orders = data.exportVal();
        let filter_orders = Object.entries(orders).filter(([key, value]) => {
          return !(status === "PENDING")
            ? value.order_payment_status === status
            : value.order_payment_status === status &&
                compareTime(new Date(value.order_payment_deadline)) === 1;
        });
        if (filter_orders.length != 0) {
          filter_orders = filter_orders.sort(
            ([key1, value1], [key2, value2]) => {
              +new Date(value1.order_payment_deadline) -
                +new Date(value2.order_payment_deadline);
            }
          );
          if (filter_orders.length >= 5) {
            return filter_orders.splice(0, 5);
          } else {
            return filter_orders;
          }
        } else {
          return false;
        }
      } else {
        return false;
      }
    })
    .catch((err) => {
      console.log(err);
      return false;
    });
};
exports.filterOrdersByUserInput = async (userid, status, date) => {
  const ref = db.ref(`${userid}/orders`);
  return await ref
    .get()
    .then((data) => {
      if (data.exists()) {
        let orders = data.exportVal();
        if (status === "PENDING") {
          const filter_orders = Object.entries(orders).filter(
            ([key, value]) => {
              let order_creation_date = new Date(
                new Date(value.order_payment_deadline).setDate(
                  new Date(value.order_payment_deadline).getDate() - 2
                )
              );

              return compareTypeOfDates(date, order_creation_date, compareTime);
            }
          );
          let sorted_orders = filter_orders.sort(
            ([key1, date1], [key2, date2]) => {
              let order_creation_date1 = new Date(
                new Date(date1.order_payment_deadline).setDate(
                  new Date(date1.order_payment_deadline).getDate() - 2
                )
              );
              let order_creation_date2 = new Date(
                new Date(date2.order_payment_deadline).setDate(
                  new Date(date2.order_payment_deadline).getDate() - 2
                )
              );
              return (
                +new Date(order_creation_date1) -
                +new Date(order_creation_date2)
              );
            }
          );
          if (sorted_orders.length === 0) {
            return false;
          } else {
            return sorted_orders;
          }
        } else if (status === "SUCCESS") {
          const filter_orders = Object.entries(orders).filter(
            ([key, value]) => {
              let order_creation_date = new Date(value.order_payment_time);
              return compareTypeOfDates(date, order_creation_date, compareTime);
            }
          );
          const sorted_orders = filter_orders.sort(
            ([key1, date1], [key2, date2]) => {
              return (
                +new Date(date1.order_payment_time) -
                +new Date(date2.order_payment_time)
              );
            }
          );
          if (sorted_orders.length === 0) {
            return false;
          } else {
            return sorted_orders;
          }
        } else if (status === "CANCELED") {
          const filter_orders = Object.entries(orders).filter(
            ([key, value]) => {
              let order_creation_date = new Date(value.canceled_at);
              return compareTypeOfDates(date, order_creation_date, compareTime);
            }
          );
          const sorted_orders = filter_orders.sort(
            ([key1, date1], [key2, date2]) => {
              return (
                +new Date(date1.canceled_at) - +new Date(date2.canceled_at)
              );
            }
          );
          if (sorted_orders.length === 0) {
            return false;
          } else {
            return sorted_orders;
          }
        }
      } else {
        return false;
      }
    })
    .catch((err) => {
      console.log(err);
      return false;
    });
};
exports.findSuccessfulOrdersForReviews = async (userid) => {
  const ref = db.ref(`${userid}`);
  return await ref
    .get()
    .then((data) => {
      if (data.exists()) {
        let user_info = data.exportVal();
        if (user_info.orders) {
          let extract_orders = [];
          Object.entries(user_info.orders).forEach(([key, value]) => {
            if (value.order_payment_status === "SUCCESS") {
              if (
                value.order_type === "order" &&
                !value.order_details.reviewStatus
              ) {
                extract_orders.push({
                  order_type: "order",
                  order_id: key,
                  quantity: value.order_quantity,
                  product_details: value.order_details,
                  date: value.order_payment_time,
                });
              } else if (value.order_type === "orders") {
                if (!value.order_details.reviewStatus) {
                  extract_orders.push({
                    order_type: "orders",
                    order_id: key,
                    product_details: Object.entries(value.order_details)
                      .map(([key1, value1]) => {
                        if (!value.reviewStatus) {
                          return {
                            order_type: "orders",
                            order_meal_id: key1,
                            meals_details: value1,
                          };
                        }
                      })
                      .filter((value) => value),
                    date: value.order_payment_time,
                  });
                }
              }
            }
          });
          if (extract_orders.length === 0) {
            return {
              errorMessage:
                "It seems that you didn't order anything yet so you can't post any review regarding any food",
            };
          } else {
            return extract_orders.sort(({ date: date1 }, { date: date2 }) => {
              +new Date(date1) - +new Date(date2);
            });
          }
        } else {
          return {
            errorMessage:
              "It seems that you didn't order anything yet so you can't post any review regarding any food",
          };
        }
      } else {
        return {
          errorMessage: "Invalid user",
        };
      }
    })
    .catch((err) => ({
      errorMessage:
        "Sorry we can't get your details it's our fault please try after sometime ",
    }));
};
exports.updateOrderReviewsByUser = async (
  userid,
  review_payload,
  type,
  user,
  date
) => {
  try {
    if (type === "orders") {
      let userref = db.ref(
        `${userid}/orders/${review_payload[0].order_id}/order_details`
      );
      await userref.update({ reviewStatus: true });
      review_payload.forEach(async (value) => {
        let reviewref = db.ref(`reviews/${value.mealid}/${naoid.nanoid(10)}`);
        let { rate, title, comment } = value.review;
        await reviewref.set({
          user: user,
          review: { rate, title, comment },
          date,
        });
      });
      return true;
    } else {
      const userref = db.ref(
        `${userid}/orders/${review_payload[0].order_id}/order_details`
      );
      const reviewref = db.ref(
        `reviews/${review_payload[0].meal_id}/${naoid.nanoid(10)}`
      );
      let { rate, title, comment } = review_payload[0].review;
      await userref.update({ reviewStatus: true });
      await reviewref.set({
        user: user,
        review: { rate, title, comment },
        date,
      });
      return true;
    }
  } catch (err) {
    console.log(err);
    return false;
  }
};
exports.getAllReviewForFood = async (mealid) => {
  const ref = db.ref(`reviews/${mealid}`);
  return await ref
    .get()
    .then((data) => {
      return data.exists() ? data.exportVal() : false;
    })
    .catch((err) => false);
};
exports.deleteOrder = async (uid, orderid) => {
  const ref = db.ref(`${uid}/orders/${orderid}`);
  await ref.remove();
};
exports.clearAllCartItems = async (uid) => {
  const ref = db.ref(`${uid}/cart`);
  await ref.remove();
};
