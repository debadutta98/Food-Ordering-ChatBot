> **Note:** You Need to set some Environment Variables before you test this Bot in localhost.

---

**Step-1**

Create a  .env on your root folder

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

Need to set the apikey of Mapbox and locationIQ API keys in a frontend javascript file



---

Video





