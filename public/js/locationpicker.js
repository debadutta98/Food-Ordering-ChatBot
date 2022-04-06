async function reverseGeoCoding(lat, lon) {
  return await fetch(
    `https://us1.locationiq.com/v1/reverse.php?key=pk.3ba76982f2610611c83a09d8af562e12&lat=${lat}&lon=${lon}&format=json`
  )
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        return { error: "connection error" };
      }
    })
    .catch((err) => {
      return { error: "connection error" };
    });
}
async function geoCoding(address) {
  return await fetch(
    `https://us1.locationiq.com/v1/search.php?key=pk.3ba76982f2610611c83a09d8af562e12&q=${address}&format=json`
  )
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        return { error: "connection error" };
      }
    })
    .catch((err) => {
      return { error: "connection error" };
    });
}

const mapHandler = async (lat = 40, lng = -74.5) => {
  mapboxgl.accessToken =
    "pk.eyJ1IjoiZGViYWR1dHRhOTEiLCJhIjoiY2t6ZmxlaDl0MHNhNjJvb2NodjBhdjBjYiJ9.Ch0hD8PS3fmFT031d32SWg";
  const map = new mapboxgl.Map({
    container: "map", // container ID
    style: "mapbox://styles/mapbox/streets-v11", // style URL
    center: [lng, lat], // starting position [lng, lat]
    zoom: 9, // starting zoom
    attributionControl: false,
  });
  map.addControl(
    new mapboxgl.AttributionControl({
      customAttribution: "Map design by me",
    })
  );
  map.addControl(
    new mapboxgl.FullscreenControl({
      container: document.querySelector("body"),
    })
  );
  map.addControl(
    new mapboxgl.GeolocateControl({
      showAccuracyCircle: true,
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
      showUserHeading: true,
    })
  );
  map.addControl(
    new mapboxgl.NavigationControl({
      visualizePitch: true,
    }),
    "bottom-right"
  );
  const marker = new mapboxgl.Marker({
    color: "#FC4F4F",
    draggable: true,
  })
    .setLngLat([lng, lat])
    .addTo(map);
  marker.on("dragend", async function () {
    const lngLat = marker.getLngLat();
    await displayAddress(lngLat.lat, lngLat.lng);
  });
  await displayAddress(lat, lng);
};
async function displayAddress(lat, lng) {
  const address = await reverseGeoCoding(lat, lng);
  if (address && !address.error) {
    let str = decodeURI(window.location.href);
    let url = new URL(str).searchParams;
    localStorage.setItem(
      "useraddress",
      JSON.stringify({
        latitude: lat,
        longitude: lng,
        single_address: address.display_name,
        address_details: address.address,
        uid: url.get("uid"),
        refId: url.get("refId"),
      })
    );
    document.getElementById("place").value = address.display_name;
  } else {
    alert("please check your connection and try again");
  }
}
const onSuccess = async (position) => {
  const storage = localStorage.getItem("useraddress");

  if (
    !storage ||
    (storage &&
      JSON.parse(storage).latitude !== position.coords.latitude &&
      JSON.parse(storage).longitude !== position.coords.longitude)
  )
    await mapHandler(position.coords.latitude, position.coords.longitude);
};
const onError = (err) => {
  alert("Please accept the location to get better user experience");
};
navigator.geolocation.watchPosition(onSuccess, onError, {
  enableHighAccuracy: true,
  timeout: 5000,
});
document
  .getElementById("place")
  .addEventListener("change", async function (event) {
    if (event.target.value !== null && event.target.value !== "") {
      const latlangcodes = await geoCoding(event.target.value);
      if (latlangcodes && !latlangcodes.error) {
        await mapHandler(latlangcodes[0].lat, latlangcodes[0].lon);
      } else {
        alert("please check your connection and try again");
      }
    } else {
      alert("Please Enter your location");
    }
  });
document
  .getElementById("address-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();
    if (window.location.protocol === "http:") {
      await fetch(`${window.location.protocol}//localhost:3978/save-address`, {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({
          ...JSON.parse(localStorage.getItem("useraddress")),
          type: document.getElementById("typeoflocation").value,
        }),
      }).then((response) => {
        if (response.ok) {
          localStorage.removeItem("useraddress");
          setTimeout(() => {
            window.open(location.href, "_self").close();
          }, 2000);
        } else {
          //unsuccessfully request
        }
      });
    } else {
      await fetch(
        `${window.location.protocol}//${window.location.hostname}/save-address`,
        {
          headers: { "Content-Type": "application/json" },
          method: "POST",
          body: JSON.stringify({
            ...JSON.parse(localStorage.getItem("useraddress")),
            type: document.getElementById("typeoflocation").value,
          }),
        }
      ).then((response) => {
        if (response.ok) {
          localStorage.removeItem("useraddress");
          setTimeout(() => {
            window.open(location.href, "_self").close();
          }, 2000);
        } else {
          //unsuccessfully request
        }
      });
    }
  });
window.onbeforeunload = onWindowClose;
function onWindowClose() {
  if (localStorage.getItem("useraddress"));
  localStorage.removeItem("useraddress");
  return null;
}
