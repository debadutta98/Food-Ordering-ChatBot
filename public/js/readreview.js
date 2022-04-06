import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
// import { set } from "../../node_modules/firebase/database/dist/database/index";
import {
  set,
  ref,
  get,
  getDatabase,
  push,
  remove,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";
const firebaseConfig = {
  apiKey: "AIzaSyBhfqaVZI6r_x22uBejolXOO2FENbGNCgY",
  authDomain: "react-practice-9211b.firebaseapp.com",
  databaseURL: "https://react-practice-9211b-default-rtdb.firebaseio.com",
  projectId: "react-practice-9211b",
  storageBucket: "react-practice-9211b.appspot.com",
  messagingSenderId: "647650802291",
  appId: "1:647650802291:web:aff4d33b3a553b70bcc806",
  measurementId: "G-YHYE25F5CB",
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
$(function () {
  var tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
  $("#rateYo").rateYo({
    starWidth: "30px",
  });
  const toggle = (type, reviewid, toggle, count) => {
    if (type === "like") {
      if (toggle) {
        $(`.comment-like-${reviewid}`).attr("data-bs-original-title", count);
        $(`.comment-like-${reviewid}`).html(
          `<i class="fa-solid fa-thumbs-up"></i>`
        );
      } else {
        $(`.comment-like-${reviewid}`).attr("data-bs-original-title", count);
        $(`.comment-like-${reviewid}`).html(
          `<i class="fa-regular fa-thumbs-up"></i>`
        );
      }
    } else {
      if (toggle) {
        $(`.comment-dislike-${reviewid}`).attr("data-bs-original-title", count);
        $(`.comment-dislike-${reviewid}`).html(
          `<i class="fa-solid fa-thumbs-down"></i>`
        );
      } else {
        $(`.comment-dislike-${reviewid}`).attr("data-bs-original-title", count);
        $(`.comment-dislike-${reviewid}`).html(
          `<i class="fa-regular fa-thumbs-down"></i>`
        );
      }
    }
  };
  const onLike = async (reviewid, mealid, uid) => {
    let instance = bootstrap.Tooltip.getInstance(
      $(`.comment-like-${reviewid}`)
    );
    let disliked = await get(
      ref(db, `reviews/${mealid}/${reviewid}/dislike/dislikeduser`)
    )
      .then(async (data) => {
        if (data.exists()) {
          let finduserdisliked = Object.entries(data.exportVal()).forEach(
            async ([key, val]) => {
              if (val.uid === uid) {
                return await remove(
                  ref(
                    db,
                    `reviews/${mealid}/${reviewid}/dislike/dislikeduser/${key}`
                  )
                )
                  .then(async (data) => {
                    return await get(
                      ref(db, `reviews/${mealid}/${reviewid}/like/value`)
                    )
                      .then(async (data) => {
                        let liked = data.exportVal();
                        return await push(
                          ref(
                            db,
                            `reviews/${mealid}/${reviewid}/like/likeduser`
                          ),
                          { uid }
                        )
                          .then(async (data) => {
                            return await set(
                              ref(
                                db,
                                `reviews/${mealid}/${reviewid}/like/value`
                              ),
                              liked + 1
                            )
                              .then(async (data) => {
                                toggle("like", reviewid, true, liked + 1);
                                instance.update();
                                instance.show();
                                return await get(
                                  ref(
                                    db,
                                    `reviews/${mealid}/${reviewid}/dislike/value`
                                  )
                                )
                                  .then(async (data) => {
                                    let disliked = data.exportVal();
                                    return await set(
                                      ref(
                                        db,
                                        `reviews/${mealid}/${reviewid}/dislike/value`
                                      ),
                                      disliked > 0 ? disliked - 1 : 0
                                    )
                                      .then((data) => {
                                        toggle(
                                          "dislike",
                                          reviewid,
                                          false,
                                          disliked > 0 ? disliked - 1 : 0
                                        );
                                        instance.update();
                                        return true;
                                      })
                                      .catch((err) => {
                                        console.log(err);
                                        return false;
                                      });
                                  })
                                  .catch((err) => {
                                    console.log(err);
                                    return undefined;
                                  });
                              })
                              .catch((err) => {
                                console.log(err);
                                return false;
                              });
                          })
                          .catch((err) => {
                            console.log(err);
                            return false;
                          });
                      })
                      .catch((err) => {
                        console.log(err);
                        return undefined;
                      });
                  })
                  .catch((err) => {
                    console.log(err);
                    return false;
                  });
              }
            }
          );
          return finduserdisliked ? true : undefined;
        } else {
          return false;
        }
      })
      .catch((err) => {
        console.log(err);
        return undefined;
      });
    if (disliked === undefined) {
      return;
    } else if (disliked) {
      return;
    } else {
      let liked = await get(
        ref(db, `reviews/${mealid}/${reviewid}/like/likeduser`)
      )
        .then(async (data) => {
          if (data.exists()) {
            let finduserliked = Object.entries(data.exportVal()).forEach(
              async ([key, val]) => {
                if (val.uid === uid) {
                  return await remove(
                    ref(
                      db,
                      `reviews/${mealid}/${reviewid}/like/likeduser/${key}`
                    )
                  )
                    .then(async (data) => {
                      //remove highlighted dislikes
                      // reduce dislike to one
                      return await get(
                        ref(db, `reviews/${mealid}/${reviewid}/like/value`)
                      )
                        .then(async (data) => {
                          let userliked = data.exportVal();
                          return await set(
                            ref(db, `reviews/${mealid}/${reviewid}/like/value`),
                            userliked > 0 ? userliked - 1 : 0
                          )
                            .then((data) => {
                              //modify dislikes
                              toggle(
                                "like",
                                reviewid,
                                false,
                                userliked > 0 ? userliked - 1 : 0
                              );
                              instance.update();
                              instance.show();
                              return true;
                            })
                            .catch((err) => {
                              console.log(err);
                              return false;
                            });
                        })
                        .catch((err) => {
                          console.log(err);
                          return undefined;
                        });
                    })
                    .catch((err) => {
                      console.log(err);
                      return false;
                    });
                }
              }
            );
            return finduserliked ? true : undefined;
          } else {
            return false;
          }
        })
        .catch((err) => {
          console.log(err);
          return undefined;
        });
      if (liked === undefined) {
        return;
      } else if (liked) {
        return;
      } else {
        return await get(ref(db, `reviews/${mealid}/${reviewid}/like/value`))
          .then(async (data) => {
            let likes = data.exists() ? data.exportVal() + 1 : 1;
            return await push(
              ref(db, `reviews/${mealid}/${reviewid}/like/likeduser`),
              { uid }
            )
              .then(async (data) => {
                return await set(
                  ref(db, `reviews/${mealid}/${reviewid}/like/value`),
                  likes
                )
                  .then((data) => {
                    toggle("like", reviewid, true, likes);
                    instance.update();
                    instance.show();
                    return true;
                  })
                  .catch((err) => {
                    console.log(err);
                    return false;
                  });
              })
              .catch((err) => {
                console.log(err);
                return false;
              });
          })
          .catch((err) => {
            console.log(err);
            return false;
          });
      }
    }
  };
  window.onLike = onLike;
  const onDisLike = async (reviewid, mealid, uid) => {
    let instance = bootstrap.Tooltip.getInstance(
      $(`.comment-dislike-${reviewid}`)
    );
    let liked = await get(
      ref(db, `reviews/${mealid}/${reviewid}/like/likeduser`)
    )
      .then(async (data) => {
        if (data.exists()) {
          let finduserliked = Object.entries(data.exportVal()).forEach(
            async ([key, val]) => {
              if (val.uid === uid) {
                return await remove(
                  ref(db, `reviews/${mealid}/${reviewid}/like/likeduser/${key}`)
                )
                  .then(async (data) => {
                    return await get(
                      ref(db, `reviews/${mealid}/${reviewid}/dislike/value`)
                    )
                      .then(async (data) => {
                        let disliked = data.exportVal();
                        return await push(
                          ref(
                            db,
                            `reviews/${mealid}/${reviewid}/dislike/dislikeduser`
                          ),
                          { uid }
                        )
                          .then(async (data) => {
                            return await set(
                              ref(
                                db,
                                `reviews/${mealid}/${reviewid}/dislike/value`
                              ),
                              disliked + 1
                            )
                              .then(async (data) => {
                                //modify dislikes
                                toggle("dislike", reviewid, true, disliked + 1);
                                instance.update();
                                instance.show();
                                return await get(
                                  ref(
                                    db,
                                    `reviews/${mealid}/${reviewid}/like/value`
                                  )
                                )
                                  .then(async (data) => {
                                    let liked = data.exportVal();
                                    return await set(
                                      ref(
                                        db,
                                        `reviews/${mealid}/${reviewid}/like/value`
                                      ),
                                      liked > 0 ? liked - 1 : 0
                                    )
                                      .then((data) => {
                                        toggle(
                                          "like",
                                          reviewid,
                                          false,
                                          liked > 0 ? liked - 1 : 0
                                        );
                                        instance.update();
                                        return true;
                                      })
                                      .catch((err) => {
                                        console.log(err);
                                        return false;
                                      });
                                  })
                                  .catch((err) => {
                                    console.log(err);
                                    return undefined;
                                  });
                              })
                              .catch((err) => {
                                console.log(err);
                                return false;
                              });
                          })
                          .catch((err) => {
                            console.log(err);
                            return false;
                          });
                      })
                      .catch((err) => {
                        console.log(err);
                        return undefined;
                      });
                  })
                  .catch((err) => {
                    console.log(err);
                    return false;
                  });
              }
            }
          );
          return finduserliked ? true : undefined;
        } else {
          return false;
        }
      })
      .catch((err) => {
        console.log(err);
        return undefined;
      });
    if (liked === undefined) {
      return;
    } else if (liked) {
      return;
    } else {
      let disliked = await get(
        ref(db, `reviews/${mealid}/${reviewid}/dislike/dislikeduser`)
      )
        .then(async (data) => {
          if (data.exists()) {
            let finduserdisliked = Object.entries(data.exportVal()).forEach(
              async ([key, val]) => {
                if (val.uid === uid) {
                  return await remove(
                    ref(
                      db,
                      `reviews/${mealid}/${reviewid}/dislike/dislikeduser/${key}`
                    )
                  )
                    .then(async (data) => {
                      //remove highlighted dislikes
                      // reduce dislike to one
                      return await get(
                        ref(db, `reviews/${mealid}/${reviewid}/dislike/value`)
                      )
                        .then(async (data) => {
                          let disliked = data.exportVal();
                          return await set(
                            ref(
                              db,
                              `reviews/${mealid}/${reviewid}/dislike/value`
                            ),
                            disliked > 0 ? disliked - 1 : 0
                          )
                            .then((data) => {
                              //modify dislikes
                              toggle(
                                "dislike",
                                reviewid,
                                false,
                                disliked > 0 ? disliked - 1 : 0
                              );
                              instance.update();
                              instance.show();
                              return true;
                            })
                            .catch((err) => {
                              console.log(err);
                              return false;
                            });
                        })
                        .catch((err) => {
                          console.log(err);
                          return undefined;
                        });
                    })
                    .catch((err) => {
                      console.log(err);
                      return false;
                    });
                }
              }
            );
            return finduserdisliked ? true : undefined;
          } else {
            return false;
          }
        })
        .catch((err) => {
          console.log(err);
          return undefined;
        });
      if (disliked === undefined) {
        return;
      } else if (disliked) {
        return;
      } else {
        return await get(ref(db, `reviews/${mealid}/${reviewid}/dislike/value`))
          .then(async (data) => {
            let dislikes = data.exists() ? data.exportVal() + 1 : 1;
            return await push(
              ref(db, `reviews/${mealid}/${reviewid}/dislike/dislikeduser`),
              { uid }
            )
              .then(async (data) => {
                return await set(
                  ref(db, `reviews/${mealid}/${reviewid}/dislike/value`),
                  dislikes
                )
                  .then((data) => {
                    toggle("dislike", reviewid, true, dislikes);
                    instance.update();
                    instance.show();
                    return true;
                  })
                  .catch((err) => {
                    console.log(err);
                    return false;
                  });
              })
              .catch((err) => {
                console.log(err);
                return false;
              });
          })
          .catch((err) => {
            console.log(err);
            return false;
          });
      }
    }
  };
  window.onDisLike = onDisLike;
});
