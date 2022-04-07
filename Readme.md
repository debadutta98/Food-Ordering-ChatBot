> **Note:** You Need to set some Environment Variables before you test this Bot in localhost.

---

**Step-1**

Create a .env in your root folder

Environment Variables

 ```
MicrosoftAppId=<AZURE-MICROSOFT-APPID>
MicrosoftAppPassword=<AZURE APPLICATION APP PASSWORD>
BASE_URL=http://localhost:3978
LOCATION_IQ_API_KEY=<Location_IQ_API_KEY>
#Auth0 secret
ISSUER_BASE_URL=<APPLICATION ISSUED URL BY AUTH0>
CLIENT_ID=<AUTH0 CLIENT ID>
SECRET=<AUTH0 CLIENT SECRETE>
#JWT token secret
JWT_SECRET=<JWT SECRETE>
#Direact line secret
DIRECT_LINE=<YOUR DIRECTLINE TOKEN>
#payment gateway details
PAYMENT_GATEWAY_ID=<CASHFREE CLIENT ID>
PAYMENT_GATEWAY_SECRETES=<CASHFREE CLIENT SECRET>
PAYMENT_GATEWAY_NOTIFY_LINK=<CASHFREE NOTIFICATION BASE URL hint:your ngrok base url>
LUISAPPId=<LUIS APP ID>
LUISsubscriptionKey=<LUIS SUBSCRIPTION KEY>
LUISendpoint=<LUIS ENDPOINT>
#SMTP secrets
SMTP_USER=<SMTP OUTLOOK USER NAME>
SMTP_PASS=<SMTP OUTLOOK PASSWORD>
```

**Step-2**

Create a file named ServiceAccountKey.json under your Helper folder and paste the json payload provide by firebase for their admin sdk

**Step-3**

Create a logger/development.log to see the developement error

**Step-4**

Need to set the apikey of Mapbox, locationIQ and Firebase API keys in a frontend javascript file 

- Go to public/js/locationpicker.js
  
``` 
Line 3: https://us1.locationiq.com/v1/reverse.php?key=<YOUR-LocationIQ-API-KEY>&lat=${lat}&lon=${lon}&format=json

Line 18: https://us1.locationiq.com/v1/search.php?key=<YOUR-LocationIQ-API-KEY>&q=${address}&format=json

Line 33: mapboxgl.accessToken = "<YOUR-MAP-BOX-API-TOKEN>"
 ```
- Go to public/js/readreview.js

```
Line 11: Paste your firebase config secrets for frontend

```


---

Video





