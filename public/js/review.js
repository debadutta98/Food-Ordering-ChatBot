$(function () {
  function validate() {
    if (
      $(rateYoField).val() !== "" &&
      Number.parseInt($(rateYoField).val()) >= 1 &&
      $("#title").val() !== "" &&
      $("#comment").val() !== ""
    ) {
      return true;
    } else {
      return false;
    }
  }
  const evaluate = () => {
    let check = setInterval(() => {
      if (validate()) {
        $("#next").prop("disabled", false);
        clearInterval(check);
      } else {
        $("#next").prop("disabled", true);
      }
    }, 100);
  };
  $("input[type='text'],textarea").on("input blur change", () => {
    evaluate();
  });
  let rateYo = $("#rateYo");
  let rateYoField = $("input[name='rateYoField']");
  $(rateYo).rateYo({
    rating: 2,
    fullStar: true,
    onInit: function (rating, rateYoInstance) {
      $(rateYoField).val(rating);
    },
    onSet: function (rating, rateYoInstance) {
      $(rateYoField).val(rating);
    },
  });
  let carousel = new bootstrap.Carousel(document.querySelector("#carousel"), {
    interval: 1000,
  });
  carousel.pause();
  let userOrder = $(`meta[name="description"]`).attr("content");
  $(`meta[name="description"]`).attr("content", "User food review page");
  let orderdetails = JSON.parse(userOrder);
  let reviewresult = [];
  let currentIndex = 0;
  if (orderdetails.order_type === "order") {
    $(".card-title").text(orderdetails.product_details.mealname);
    $("#next").text("Submit");
    $("#next").attr("type", "submit");
    evaluate();
  } else {
    $(".card-title").text(
      orderdetails.product_details[0].meals_details.mealname
    );
    evaluate();
  }
  $(`#next`).on("mousedown", () => {
    evaluate();
    if (
      $("#prev").css("display") === "none" &&
      orderdetails.order_type !== "order"
    ) {
      $("#prev").css("display", "inline");
      reviewresult.push({
        name: orderdetails.product_details[currentIndex].meals_details.mealname,
        rate: $(rateYoField).val(),
        title: $("#title").val(),
        comment: $("#comment").val(),
      });
      currentIndex++;
      carousel.next();
      $(".card-title").text(
        orderdetails.product_details[currentIndex].meals_details.mealname
      );
      $(rateYoField).val(0);
      $("#rateYo").rateYo("option", "rating", 2);
      $("#title").val("");
      $("#comment").val("");
      if (currentIndex === orderdetails.product_details.length - 1) {
        $("#next").text("Submit");
        $(".card-title").text(
          orderdetails.product_details[currentIndex].meals_details.mealname
        );
        $("#next").attr("type", "submit");
      }
    } else if (
      orderdetails.order_type === "orders" &&
      currentIndex < orderdetails.product_details.length - 1
    ) {
      currentIndex++;
      if (currentIndex === orderdetails.product_details.length - 1) {
        $("#next").text("Submit");
        $("#next").attr("type", "submit");
        $(".card-title").text(
          orderdetails.product_details[currentIndex].meals_details.mealname
        );
      }
      reviewresult.push({
        name: orderdetails.product_details[currentIndex].meals_details.mealname,
        rate: $(rateYoField).val(),
        title: $("#title").val(),
        comment: $("#comment").val(),
      });
      $(rateYoField).val("");
      $("#rateYo").rateYo("option", "rating", 2);
      $("#title").val("");
      $("#comment").val("");
      carousel.next();
    }
  });
  $("#prev").on("click", () => {
    if (currentIndex > 0) {
      currentIndex--;
      console.log(["current Index"], currentIndex);
      $("#next").attr("type", "button");
      $("#next").html(
        `<span>Next&nbsp;</span><i class="fa-solid fa-chevron-right"></i>`
      );
      $(".card-title").text(
        orderdetails.product_details[currentIndex].meals_details.mealname
      );
      $(rateYoField).val(reviewresult[currentIndex].rate);
      $("#title").val(reviewresult[currentIndex].title);
      $("#comment").val(reviewresult[currentIndex].comment);
      $("#rateYo").rateYo("option", "rating", +reviewresult[currentIndex].rate);
      carousel.prev();
    } else if (currentIndex === 0) {
      $(".card-title").text(
        orderdetails.product_details[0].meals_details.mealname
      );
      $(rateYoField).val(reviewresult[0].rate);
      $("#title").val(reviewresult[0].title);
      $("#comment").val(reviewresult[0].comment);
      $("#rateYo").rateYo("option", "rating", +reviewresult[0].rate);
      $("#next").attr("type", "button");
      $("#next").html(
        `<span>Next&nbsp;</span><i class="fa-solid fa-chevron-right"></i>`
      );
    }
  });
  $("form").on("submit", async (event) => {
    event.stopImmediatePropagation();
    event.stopPropagation();
    event.preventDefault();
    carousel.next();
    let rate = $(rateYoField).val();
    let title = $("#title").val();
    let comment = $("#comment").val();
    reviewresult.push({
      name:
        orderdetails.order_type === "orders"
          ? orderdetails.product_details[currentIndex].meals_details.mealname
          : orderdetails.product_details.mealname,
      rate,
      title,
      comment,
    });
    $(".card-body > .card-title").text("In Progress...");
    $(".card-body > form").html(
      '<div style="display:flex;justify-content:center;"><img src="/img/progress.gif"/></div>'
    );
    let modify_reviewresult =
      orderdetails.order_type === "order"
        ? [
            {
              order_id: orderdetails.order_id,
              meal_id: orderdetails.product_details.mealid,
              review: reviewresult[0],
            },
          ]
        : reviewresult.map((value, index) => {
            console.log(orderdetails.product_details[index]);
            return {
              order_id: orderdetails.order_id,
              mealid: orderdetails.product_details[index].meals_details.mealid,
              order_meal_id: orderdetails.product_details[index].order_meal_id,
              review: value,
            };
          });
    await fetch(location.href + "/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(modify_reviewresult),
    })
      .then((res) => {
        if (res.status === 200) {
          $(".card-body > .card-title").text(
            "Your Review is submitted Successfully!!"
          );
          $(".card-body > form").replaceWith(
            '<div style="display:flex;justify-content:center;"> <img src="/img/success.png" width="100" height="100"/></div>'
          );
          setTimeout(() => {
            window.open("", "_self").close();
          }, 2000);
        } else {
          $(".card-body > .card-title").text(
            "Unable to Proceed with your request Please Try Again!!!"
          );
          $(".card-body > form").replaceWith(
            '<div style="display:flex;justify-content:center;"><img src="/img/error.gif"/></div>'
          );
          setTimeout(() => {
            window.open("", "_self").close();
          }, 2000);
        }
      })
      .catch((err) => {
        $(".card-body > .card-title").text(
          "Unable to Proceed with your request Please Try Again!!!"
        );
        $(".card-body > form").replaceWith(
          '<div style="display:flex;justify-content:center;"><img src="/img/error.gif"/></div>'
        );
        setTimeout(() => {
          window.open("", "_self").close();
        }, 2000);
      });
  });
});
