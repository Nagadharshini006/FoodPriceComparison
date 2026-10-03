
/* =========================
   PROFILE PAGE
========================= */
const API_BASE = 'https://smartfoodcomparebackend-production.up.railway.app/api';
// Get logged-in user's email
function loadProfile() {

    const email = localStorage.getItem('userEmail');

    const emailElement = document.getElementById('userEmail');

    if (emailElement) {

        if (email) {
            emailElement.textContent = email;
        } else {
            emailElement.textContent = 'No email found';
        }
    }


    // Load saved location (belongs to the logged-in user only)
    showSavedLocation();


    // Load order count
    loadOrderCount();
}


/* =========================
   LOAD ORDER COUNT
========================= */

async function loadOrderCount() {

    const token = localStorage.getItem('authToken');

    const orderElement = document.getElementById('orderCount');

    if (!orderElement) return;

    if (!token) {
        orderElement.textContent = '0';
        return;
    }

    try {

        const response = await fetch(API_BASE + '/orders/my', {
            method: 'GET',

            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            orderElement.textContent = '0';
            return;
        }

        const orders = await response.json();

        orderElement.textContent = `${orders.length}`;

    } catch (error) {

        console.error('Could not load order count:', error);

        orderElement.textContent = '0';
    }
}


/* =========================
   LOCATION DATA
   (same list the Home page uses in food.js)
========================= */

const locationData = {

    'Tamil Nadu': {

        'Chennai': [
            'T. Nagar',
            'Anna Nagar',
            'Adyar',
            'Velachery',
            'Tambaram',
            'Porur'
        ],

        'Coimbatore': [
            'RS Puram',
            'Gandhipuram',
            'Saibaba Colony',
            'Peelamedu',
            'Singanallur',
            'Townhall'
        ],

        'Madurai': [
            'Anna Nagar',
            'K.K. Nagar',
            'Goripalayam',
            'Thiruparankundram',
            'Villapuram'
        ],

        'Salem': [
            'Fort',
            'Fairlands',
            'Ammapet',
            'Shevapet',
            'Hasthampatti'
        ],

        'Tiruchirappalli': [
            'Cantonment',
            'Srirangam',
            'K.K. Nagar',
            'Thillai Nagar',
            'Puthur'
        ]

    },

    'Karnataka': {

        'Bangalore': [
            'Indiranagar',
            'Koramangala',
            'Whitefield',
            'Electronic City',
            'JP Nagar',
            'Marathahalli'
        ],

        'Mysore': [
            'Vijayanagar',
            'Kuvempunagar',
            'Jayalakshmipuram',
            'Gokulam',
            'VV Mohalla'
        ],

        'Mangalore': [
            'Hampankatta',
            'Kadri',
            'Bejai',
            'Kankanady',
            'Kodialbail'
        ],

        'Hubli': [
            'Vidyanagar',
            'Gokul Road',
            'Navanagar',
            'Unkal',
            'Hosur'
        ]

    },

    'Maharashtra': {

        'Mumbai': [
            'Andheri',
            'Bandra',
            'Powai',
            'Worli',
            'Colaba',
            'Juhu'
        ],

        'Pune': [
            'Koregaon Park',
            'Hinjewadi',
            'Kothrud',
            'Viman Nagar',
            'Hadapsar',
            'Shivaji Nagar'
        ],

        'Nagpur': [
            'Dharampeth',
            'Sadar',
            'Sitabuldi',
            'Hingna',
            'Kamptee'
        ],

        'Nashik': [
            'College Road',
            'Panchavati',
            'Satpur',
            'Gangapur Road',
            'Ashok Stambh'
        ]

    },

    'Delhi': {

        'New Delhi': [
            'Connaught Place',
            'Saket',
            'Dwarka',
            'Rohini',
            'Janakpuri',
            'Lajpat Nagar'
        ],

        'South Delhi': [
            'Greater Kailash',
            'Hauz Khas',
            'Green Park',
            'Vasant Vihar',
            'Defence Colony'
        ],

        'North Delhi': [
            'Pitampura',
            'Model Town',
            'Civil Lines',
            'Ashok Vihar'
        ],

        'East Delhi': [
            'Laxmi Nagar',
            'Preet Vihar',
            'Mayur Vihar',
            'Patparganj'
        ]

    },

    'Telangana': {

        'Hyderabad': [
            'Banjara Hills',
            'Jubilee Hills',
            'HITEC City',
            'Gachibowli',
            'Kukatpally',
            'Madhapur'
        ],

        'Warangal': [
            'Hanamkonda',
            'Kazipet',
            'Subedari',
            'Station Road'
        ],

        'Nizamabad': [
            'Bodhan Road',
            'Armoor Road',
            'Main Road',
            'Civil Lines'
        ]

    },

    'West Bengal': {

        'Kolkata': [
            'Park Street',
            'Salt Lake',
            'Ballygunge',
            'New Alipore',
            'Rajarhat',
            'Howrah'
        ],

        'Siliguri': [
            'Matigara',
            'Pradhan Nagar',
            'Hill Cart Road',
            'Sevoke Road'
        ],

        'Durgapur': [
            'City Centre',
            'Benachity',
            'Steel Township',
            'Bidhannagar'
        ]

    },

    'Rajasthan': {

        'Jaipur': [
            'Malviya Nagar',
            'Vaishali Nagar',
            'C Scheme',
            'Mansarovar',
            'Raja Park'
        ],

        'Udaipur': [
            'Fateh Sagar',
            'Hiran Magri',
            'Sector 3',
            'University Road'
        ],

        'Jodhpur': [
            'Sardarpura',
            'Paota',
            'Ratanada',
            'Shastri Nagar'
        ]

    }

};


/* =========================
   PER-USER LOCATION STORAGE
========================= */

// Identify the logged-in user from the id inside the login token
// (falls back to the email if the token cannot be read)
function getLocationStorageKey() {

    const token = localStorage.getItem('authToken');

    try {

        const payload = JSON.parse(
            atob(
                token
                    .split('.')[1]
                    .replace(/-/g, '+')
                    .replace(/_/g, '/')
            )
        );

        if (payload && payload.id) {
            return 'selectedLocation:user_' + payload.id;
        }

    } catch (error) {
        // fall through to email
    }

    const email = localStorage.getItem('userEmail');

    return email
        ? 'selectedLocation:email_' + email.toLowerCase()
        : null;
}

function getSavedProfileLocation() {

    const key = getLocationStorageKey();

    if (!key) return null;

    try {

        const saved = JSON.parse(localStorage.getItem(key));

        if (saved && saved.state && saved.city && saved.area) {
            return saved;
        }

    } catch (error) {
        console.error('Could not read saved location:', error);
    }

    return null;
}

function showSavedLocation() {

    const locationElement = document.getElementById('userLocation');

    if (!locationElement) return;

    const saved = getSavedProfileLocation();

    locationElement.textContent = saved
        ? saved.area + ', ' + saved.city + ', ' + saved.state
        : 'No location selected';
}


/* =========================
   LOCATION EDITOR
========================= */

function fillSelect(select, placeholder, values) {

    select.innerHTML = '';

    const first = document.createElement('option');
    first.value = '';
    first.textContent = placeholder;
    select.appendChild(first);

    values.forEach(function (value) {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
    });
}

function populateProfileStates() {

    fillSelect(
        document.getElementById('profileState'),
        'Select State',
        Object.keys(locationData).sort()
    );
}

function updateProfileCities() {

    const state = document.getElementById('profileState').value;
    const citySelect = document.getElementById('profileCity');
    const areaSelect = document.getElementById('profileArea');

    fillSelect(citySelect, 'Select City', []);
    fillSelect(areaSelect, 'Select Area', []);

    citySelect.disabled = true;
    areaSelect.disabled = true;

    if (state && locationData[state]) {

        fillSelect(
            citySelect,
            'Select City',
            Object.keys(locationData[state]).sort()
        );

        citySelect.disabled = false;
    }
}

function updateProfileAreas() {

    const state = document.getElementById('profileState').value;
    const city = document.getElementById('profileCity').value;
    const areaSelect = document.getElementById('profileArea');

    fillSelect(areaSelect, 'Select Area', []);

    areaSelect.disabled = true;

    if (state && city && locationData[state] && locationData[state][city]) {

        fillSelect(
            areaSelect,
            'Select Area',
            locationData[state][city]
        );

        areaSelect.disabled = false;
    }
}

function showLocationEditor() {

    populateProfileStates();

    // Start from the previously saved location (if any)
    const saved = getSavedProfileLocation();

    document.getElementById('profileState').value = saved ? saved.state : '';
    updateProfileCities();

    if (saved) {
        document.getElementById('profileCity').value = saved.city;
        updateProfileAreas();
        document.getElementById('profileArea').value = saved.area;
    }

    document.getElementById('locationEditor').classList.add('show');
}

function hideLocationEditor() {

    // Cancel: close only, nothing is saved or changed
    document.getElementById('locationEditor').classList.remove('show');
}

function saveProfileLocation() {

    const state = document.getElementById('profileState').value;
    const city = document.getElementById('profileCity').value;
    const area = document.getElementById('profileArea').value;

    if (!state || !city || !area) {
        alert('Please select State, City and Area.');
        return;
    }

    const key = getLocationStorageKey();

    if (!key) {
        alert('Please login again.');
        return;
    }

    localStorage.setItem(
        key,
        JSON.stringify({ state: state, city: city, area: area })
    );

    showSavedLocation();

    hideLocationEditor();
}


/* =========================
   GO HOME
========================= */

function goHome() {

    window.location.href = 'food.html';
}


/* =========================
   BOTTOM NAVIGATION
========================= */

function goOrders() {

    window.location.href = 'orders.html';
}

function goSaved() {

    window.location.href = 'saved.html';
}

function goProfile() {

    window.location.href = 'profile.html';
}


/* =========================
   LOGOUT
========================= */

function logout() {

    const confirmLogout = confirm(
        'Are you sure you want to logout?'
    );

    if (!confirmLogout) {
        return;
    }

    // Remove login information
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('isLoggedIn');

    // Go back to login page
    window.location.replace('login-simple.html');
}


/* =========================
   PAGE LOAD
========================= */

document.addEventListener('DOMContentLoaded', function () {

    loadProfile();

    console.log('Profile page loaded successfully');

});
