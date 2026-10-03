# Food Price Comparator - Complete Version

This folder contains the corrected frontend plus a Node.js/Express/MySQL backend.

## Fixes included
- Comparison results replace the previous result instead of being appended repeatedly.
- Orders are saved once through the backend instead of localStorage.
- Admin logout removes the authentication token and returns to admin login.
- Admin panel reads orders/statistics from MySQL.
- CSV download remains available in the admin panel.
- User and admin login use JWT authentication.
- Passwords are hashed with bcrypt.
- Food comparison records are stored in MySQL.
- Order links include the selected food + area + city in the external search query.

## Important limitation about Zomato/Swiggy location
The current project does not use an official Zomato/Swiggy partner API. Therefore the app cannot guarantee that an external website will open the exact restaurant in the selected area. The link is made location-aware by including food + area + city in the search query. Exact restaurant deep-linking requires an official platform API/deep-link supplied by the platform.

## Run backend
1. Install Node.js.
2. Open MySQL Workbench and run `database.sql`.
3. Copy `backend/.env.example` to `backend/.env` and enter your MySQL password.
4. Open a terminal in `backend` and run:
   `npm install`
5. Create/reset the admin account:
   `npm run seed-admin`
6. Start the server:
   `npm start`
7. Open:
   `http://localhost:5000`

Admin login:
- Username: admin
- Password: admin@123

## Android Studio
For the WebView app, load the backend URL instead of opening the HTML files directly. During laptop testing on a physical phone, replace localhost with the laptop's LAN IP, for example `http://192.168.1.10:5000`, and keep the phone and laptop on the same Wi-Fi.

For a final deployed app, host the backend on HTTPS and point the Android WebView to the HTTPS URL.
