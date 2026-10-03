// =====================================================
// BACKEND CONFIGURATION
// =====================================================

const API_BASE = 'https://smartfoodcomparebackend-production.up.railway.app/api';

const authToken = localStorage.getItem('authToken');

if (!authToken) {
    window.location.replace('login-simple.html');
}

const userEmail = localStorage.getItem('userEmail') || '';


// =====================================================
// AUTH HEADERS
// =====================================================

function authHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('authToken')
    };
}


// =====================================================
// LOGOUT
// =====================================================

function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');

    sessionStorage.clear();

    window.location.replace('login-simple.html');
}


// =====================================================
// DISPLAY USER EMAIL
// =====================================================

document.addEventListener('DOMContentLoaded', function () {

    const emailElement = document.getElementById('userEmail');

    if (emailElement) {
        emailElement.textContent = userEmail;
    }

});


// =====================================================
// VIEW DETAILS
// =====================================================

function viewDetails(foodName, foodData, location) {

    sessionStorage.setItem('foodName', foodName);

    sessionStorage.setItem(
        'foodData',
        JSON.stringify(foodData)
    );

    sessionStorage.setItem(
        'location',
        JSON.stringify(location)
    );

    window.location.href = 'details.html';
}


// =====================================================
// CURRENT SEARCH DATA
// =====================================================

let currentSearchTerm = '';
let currentFoodData = null;
let currentLocation = null;

let orderInProgress = false;

let currentComparisonId = null;
let currentIsFavorite = false;


// =====================================================
// LOCATION DATABASE
// =====================================================

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


// =====================================================
// GENERATE ORDER URL
// =====================================================


function generateOrderUrl(foodName, platform, city) {

    const platformName =
        platform.toLowerCase().trim();

    // Zomato homepage only
    if (platformName === 'zomato') {
        return 'https://www.zomato.com/';
    }

    // Swiggy homepage only
    if (platformName === 'swiggy') {
        return 'https://www.swiggy.com/';
    }

    return '#';
}



// =====================================================
// GET ORDER URL
// =====================================================

function getOrderUrl(row, foodName, platform) {

    // Always build the URL from the CURRENT food (and city). The stored
    // row.orderUrl is a fixed link and caused old searches to reappear.
    return generateOrderUrl(
        foodName,
        platform,
        row && row.city
    );
}


// =====================================================
// POPULATE STATES
// =====================================================

function populateStates() {

    const stateSelect =
        document.getElementById('stateSelect');

    if (!stateSelect) return;

    stateSelect.innerHTML =
        '<option value="">Select State</option>';

    const states =
        Object.keys(locationData).sort();

    states.forEach(function (state) {

        const option =
            document.createElement('option');

        option.value = state;
        option.textContent = state;

        stateSelect.appendChild(option);

    });
}


// =====================================================
// UPDATE CITIES
// =====================================================

function updateCities() {

    const stateSelect =
        document.getElementById('stateSelect');

    const citySelect =
        document.getElementById('citySelect');

    const areaSelect =
        document.getElementById('areaSelect');

    const locationInfo =
        document.getElementById('locationInfo');

    if (!stateSelect || !citySelect || !areaSelect) {
        return;
    }

    const selectedState =
        stateSelect.value;

    citySelect.innerHTML =
        '<option value="">Select City</option>';

    areaSelect.innerHTML =
        '<option value="">Select Area</option>';

    citySelect.disabled = true;
    areaSelect.disabled = true;

    if (selectedState) {

        citySelect.disabled = false;

        const cities =
            Object.keys(
                locationData[selectedState]
            ).sort();

        cities.forEach(function (city) {

            const option =
                document.createElement('option');

            option.value = city;
            option.textContent = city;

            citySelect.appendChild(option);

        });

        if (locationInfo) {
            locationInfo.innerHTML =
                '📌 ' +
                cities.length +
                ' cities available in ' +
                selectedState;
        }

    } else {

        if (locationInfo) {
            locationInfo.innerHTML =
                '📌 Please select your location';
        }
    }
}


// =====================================================
// UPDATE AREAS
// =====================================================

function updateAreas() {

    const stateSelect =
        document.getElementById('stateSelect');

    const citySelect =
        document.getElementById('citySelect');

    const areaSelect =
        document.getElementById('areaSelect');

    const locationInfo =
        document.getElementById('locationInfo');

    if (!stateSelect || !citySelect || !areaSelect) {
        return;
    }

    const selectedState =
        stateSelect.value;

    const selectedCity =
        citySelect.value;

    areaSelect.innerHTML =
        '<option value="">Select Area</option>';

    areaSelect.disabled = true;

    if (selectedCity) {

        areaSelect.disabled = false;

        const areas =
            locationData[selectedState][selectedCity];

        areas.forEach(function (area) {

            const option =
                document.createElement('option');

            option.value = area;
            option.textContent = area;

            areaSelect.appendChild(option);

        });

        if (locationInfo) {
            locationInfo.innerHTML =
                '📌 ' +
                areas.length +
                ' areas available in ' +
                selectedCity +
                ', ' +
                selectedState;
        }

    }
}


// =====================================================
// GET SELECTED LOCATION
// =====================================================

function getSelectedLocation() {

    const stateElement =
        document.getElementById('stateSelect');

    const cityElement =
        document.getElementById('citySelect');

    const areaElement =
        document.getElementById('areaSelect');

    if (!stateElement || !cityElement || !areaElement) {
        return null;
    }

    const state = stateElement.value;
    const city = cityElement.value;
    const area = areaElement.value;

    if (state && city && area) {

        return {
            state: state,
            city: city,
            area: area,
            full: area + ', ' + city + ', ' + state
        };

    }

    return null;
}


// =====================================================
// QUALITY BADGE
// =====================================================

function getQualityBadge(quality) {

    const badges = {

        best:
            '<span class="badge best-badge">Best Quality</span>',

        good:
            '<span class="badge good-badge">Good Quality</span>',

        average:
            '<span class="badge average-badge">Average Quality</span>'

    };

    return badges[quality] || '';
}


// =====================================================
// QUALITY FROM RATING
// =====================================================

function getQualityFromRating(rating) {

    if (rating >= 4.4) {
        return 'best';
    }

    if (rating >= 4.0) {
        return 'good';
    }

    return 'average';
}


// =====================================================
// DETERMINE WINNER
// =====================================================

function determineWinner(zomato, swiggy) {

    const zomatoScore =
        (zomato.rating * 0.4) +
        ((500 - zomato.price) / 500 * 0.3) +
        (
            zomato.quality === 'best'
                ? 0.3
                : zomato.quality === 'good'
                    ? 0.15
                    : 0
        );

    const swiggyScore =
        (swiggy.rating * 0.4) +
        ((500 - swiggy.price) / 500 * 0.3) +
        (
            swiggy.quality === 'best'
                ? 0.3
                : swiggy.quality === 'good'
                    ? 0.15
                    : 0
        );

    return zomatoScore > swiggyScore
        ? 'zomato'
        : 'swiggy';
}


// =====================================================
// ================= SAVED / FAVOURITE ==================
// =====================================================


// Saved comparisons live in the database and belong to the logged-in user
// (comparisons.user_id = req.user.id, is_favorite = TRUE). Nothing is kept in
// a browser-wide localStorage key, so different accounts never share them.

// IDs of the current user's saved rows matching the current food + location
let currentSavedIds = [];

let favoriteInProgress = false;


// Mark / unmark one of the current user's comparisons as saved
async function setFavorite(id, isFavorite) {

    const response =
        await fetch(
            API_BASE + '/comparisons/' + id + '/favorite',
            {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify({ isFavorite: isFavorite })
            }
        );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            'Could not update saved comparison'
        );
    }

    return data;
}


// Create unique ID for comparison
function createComparisonKey(
    foodName,
    location
) {

    return (
        foodName.toLowerCase().trim() +
        '|' +
        location.state.toLowerCase().trim() +
        '|' +
        location.city.toLowerCase().trim() +
        '|' +
        location.area.toLowerCase().trim()
    );

}


// Find the current user's saved rows for this food + location
async function fetchMatchingSavedIds(
    foodName,
    location
) {

    const response =
        await fetch(
            API_BASE + '/comparisons/saved',
            {
                method: 'GET',
                headers: authHeaders()
            }
        );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            'Could not load saved comparisons'
        );
    }

    const key =
        createComparisonKey(
            foodName,
            location
        );

    return data
        .filter(function (item) {

            return createComparisonKey(
                item.foodName,
                {
                    state: item.state,
                    city: item.city,
                    area: item.area
                }
            ) === key;

        })
        .map(function (item) {
            return item.id;
        });
}


// =====================================================
// SAVE CURRENT COMPARISON
// =====================================================

async function saveCurrentFavorite() {

    if (
        !currentSearchTerm ||
        !currentFoodData ||
        !currentLocation
    ) {

        alert(
            'Please search and compare a food first.'
        );

        return;
    }

    if (favoriteInProgress) {
        return;
    }

    favoriteInProgress = true;

    try {

        // Already saved -> remove (only this user's rows)
        if (currentIsFavorite && currentSavedIds.length > 0) {

            for (const id of currentSavedIds) {
                await setFavorite(id, false);
            }

            currentSavedIds = [];

            currentIsFavorite = false;

            updateFavoriteButton();

            alert('Removed from Saved ❤️');

            return;
        }


        // Save new comparison
        if (!currentComparisonId) {

            await saveComparison(
                currentSearchTerm,
                currentFoodData,
                currentLocation,
                determineWinner(
                    currentFoodData.zomato,
                    currentFoodData.swiggy
                )
            );
        }

        if (!currentComparisonId) {

            throw new Error(
                'Comparison could not be saved. Please try again.'
            );
        }

        await setFavorite(currentComparisonId, true);

        currentSavedIds = [currentComparisonId];

        currentIsFavorite = true;

        updateFavoriteButton();

        alert('Comparison saved ❤️');

    } catch (error) {

        alert(error.message);

    } finally {

        favoriteInProgress = false;
    }
}


// =====================================================
// UPDATE SAVE BUTTON
// =====================================================

function updateFavoriteButton() {

    const button =
        document.getElementById(
            'favoriteButton'
        );

    if (!button) {
        return;
    }

    if (currentIsFavorite) {

        button.innerHTML =
            '❤️ Saved';

        button.classList.add(
            'saved-active'
        );

    } else {

        button.innerHTML =
            '🤍 Save Comparison';

        button.classList.remove(
            'saved-active'
        );
    }
}


// =====================================================
// CHECK CURRENT FAVOURITE
// =====================================================

async function checkCurrentFavorite() {

    currentSavedIds = [];

    if (
        !currentSearchTerm ||
        !currentLocation
    ) {

        currentIsFavorite = false;

        return;
    }

    try {

        currentSavedIds =
            await fetchMatchingSavedIds(
                currentSearchTerm,
                currentLocation
            );

    } catch (error) {

        console.warn(
            'Could not check saved state:',
            error.message
        );
    }

    currentIsFavorite =
        currentSavedIds.length > 0;
}


// =====================================================
// SAVE ORDER
// =====================================================

async function saveOrder(
    foodName,
    platform,
    foodData,
    location
) {

    const response =
        await fetch(
            API_BASE + '/orders',
            {
                method: 'POST',

                headers: authHeaders(),

                body: JSON.stringify({

                    foodName:
                        foodName,

                    platform:
                        platform.toLowerCase(),

                    foodData:
                        foodData,

                    location:
                        location

                })
            }
        );

    const data =
        await response.json();

    if (!response.ok) {

        throw new Error(
            data.message ||
            'Order could not be saved'
        );
    }

    return data;
}


// =====================================================
// SAVE COMPARISON TO DATABASE
// =====================================================

async function saveComparison(
    foodName,
    foodData,
    location,
    winner
) {

    try {

        const response =
            await fetch(
                API_BASE + '/comparisons',
                {
                    method: 'POST',

                    headers: authHeaders(),

                    body: JSON.stringify({

                        foodName:
                            foodName,

                        foodData:
                            foodData,

                        location:
                            location,

                        winner:
                            winner

                    })
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            throw new Error(
                data.message ||
                'Comparison could not be saved'
            );
        }

        currentComparisonId =
            data.id;

        return data;

    } catch (error) {

        console.warn(
            'Database comparison save failed:',
            error.message
        );

        return null;
    }
}


// =====================================================
// ORDER FOOD
// =====================================================

async function orderFood(
    url,
    platform
) {

    if (orderInProgress) {
        return;
    }

    if (
        !currentSearchTerm ||
        !currentFoodData ||
        !currentLocation
    ) {

        alert(
            'Please compare the food again before ordering.'
        );

        return;
    }

    orderInProgress = true;

    try {

        await saveOrder(
            currentSearchTerm,
            platform,
            currentFoodData,
            currentLocation
        );

        window.open(
            url,
            '_blank'
        );

    } catch (error) {

        alert(error.message);

    } finally {

        setTimeout(
            function () {

                orderInProgress = false;

            },
            800
        );
    }
}


// =====================================================
// FOOD SEARCH
// =====================================================

async function searchFood() {

    const searchElement =
        document.getElementById(
            'foodSearch'
        );

    const resultsDiv =
        document.getElementById(
            'results'
        );

    if (!searchElement || !resultsDiv) {
        return;
    }

    const searchTerm =
        searchElement.value
            .toLowerCase()
            .trim();

    const location =
        getSelectedLocation();


    // =================================================
    // VALIDATE FOOD
    // =================================================

    if (!searchTerm) {

        resultsDiv.innerHTML = `

            <div class="no-results">

                <div class="no-results-icon">
                    🔍
                </div>

                <div class="no-results-text">
                    Please enter a food name to compare
                </div>

            </div>

        `;

        return;
    }


    // =================================================
    // VALIDATE LOCATION
    // =================================================

    if (!location) {

        resultsDiv.innerHTML = `

            <div class="no-results">

                <div class="no-results-icon">
                    📍
                </div>

                <div class="no-results-text">
                    Please select State, City and Area
                </div>

            </div>

        `;

        return;
    }


    // =================================================
    // LOADING
    // =================================================

    resultsDiv.innerHTML = `

        <div class="no-results">

            <div class="no-results-icon">
                🔄
            </div>

            <div class="no-results-text">

                Searching ${capitalize(searchTerm)}
                in ${location.area},
                ${location.city}...

            </div>

        </div>

    `;


    try {

        // =================================================
        // API URL
        // =================================================

        const url =
            `${API_BASE}/food/search` +
            `?food=${encodeURIComponent(searchTerm)}` +
            `&state=${encodeURIComponent(location.state)}` +
            `&city=${encodeURIComponent(location.city)}` +
            `&area=${encodeURIComponent(location.area)}`;


        const response =
            await fetch(
                url,
                {
                    method: 'GET',
                    headers: authHeaders()
                }
            );


        const data =
            await response.json();


        console.log(
            'Food search response:',
            data
        );


        if (!response.ok) {

            throw new Error(
                data.message ||
                'Food search failed'
            );
        }


        // =================================================
        // NO RESULTS
        // =================================================

        if (
            !data.results ||
            data.results.length === 0
        ) {

            resultsDiv.innerHTML = `

                <div class="no-results">

                    <div class="no-results-icon">
                        🍽️
                    </div>

                    <div class="no-results-text">

                        No ${capitalize(searchTerm)}
                        found in
                        ${location.area},
                        ${location.city}

                    </div>

                    <p style="color:#666;margin-top:10px;">
                        Try another food or location.
                    </p>

                </div>

            `;

            return;
        }


        // =================================================
        // FIND ZOMATO
        // =================================================

        const zomato =
            data.results.find(
                item =>
                    item.platform &&
                    item.platform
                        .toLowerCase() === 'zomato'
            );


        // =================================================
        // FIND SWIGGY
        // =================================================

        const swiggy =
            data.results.find(
                item =>
                    item.platform &&
                    item.platform
                        .toLowerCase() === 'swiggy'
            );


        // =================================================
        // REQUIRE BOTH PLATFORMS
        // =================================================

        if (!zomato || !swiggy) {

            resultsDiv.innerHTML = `

                <div class="no-results">

                    <div class="no-results-icon">
                        ⚠️
                    </div>

                    <div class="no-results-text">

                        Complete comparison data is not
                        available for
                        ${capitalize(searchTerm)}
                        in ${location.area}.

                    </div>

                </div>

            `;

            return;
        }


        // =================================================
        // ORDER URLS
        // =================================================

        const zomatoOrderUrl =
            getOrderUrl(
                zomato,
                searchTerm,
                'zomato'
            );


        const swiggyOrderUrl =
            getOrderUrl(
                swiggy,
                searchTerm,
                'swiggy'
            );


        // =================================================
        // FOOD DATA
        // =================================================

        const foodData = {

            zomato: {

                restaurant:
                    zomato.restaurant,

                price:
                    Number(zomato.price),

                rating:
                    Number(zomato.rating),

                quality:
                    getQualityFromRating(
                        Number(zomato.rating)
                    ),

                deliveryTime:
                    Number(
                        zomato.deliveryTime ||
                        zomato.delivery_time ||
                        0
                    ),

                reviews:
                    Number(
                        zomato.reviews ||
                        0
                    ),

                orderUrl:
                    zomatoOrderUrl

            },


            swiggy: {

                restaurant:
                    swiggy.restaurant,

                price:
                    Number(swiggy.price),

                rating:
                    Number(swiggy.rating),

                quality:
                    getQualityFromRating(
                        Number(swiggy.rating)
                    ),

                deliveryTime:
                    Number(
                        swiggy.deliveryTime ||
                        swiggy.delivery_time ||
                        0
                    ),

                reviews:
                    Number(
                        swiggy.reviews ||
                        0
                    ),

                orderUrl:
                    swiggyOrderUrl

            }

        };


        // =================================================
        // WINNER
        // =================================================

        const winner =
            determineWinner(
                foodData.zomato,
                foodData.swiggy
            );


        // =================================================
        // STORE CURRENT DATA
        // =================================================

        currentSearchTerm =
            searchTerm;

        currentFoodData =
            foodData;

        currentLocation =
            location;


        // =================================================
        // CHECK IF ALREADY SAVED
        // =================================================

        currentComparisonId = null;

        await checkCurrentFavorite();


        // =================================================
        // SAVE COMPARISON TO DATABASE
        // =================================================

        await saveComparison(
            searchTerm,
            foodData,
            location,
            winner
        );


        // =================================================
        // DISPLAY RESULTS
        // =================================================

        resultsDiv.innerHTML = `

            <!-- SAVE BUTTON -->

            <div
                class="save-comparison-container"
                style="
                    display:flex;
                    justify-content:center;
                    margin:20px 0;
                "
            >

                <button
                    id="favoriteButton"
                    class="favorite-button"
                    onclick="saveCurrentFavorite()"
                    style="
                        padding:12px 22px;
                        border:none;
                        border-radius:25px;
                        cursor:pointer;
                        font-size:16px;
                        font-weight:600;
                        background:#f3f3f3;
                        color:#333;
                    "
                >
                    🤍 Save Comparison
                </button>

            </div>


            <!-- COMPARISON -->

            <div class="comparison-container">


                <!-- ZOMATO -->

                <div class="platform-card zomato-card">

                    <div class="platform-header">

                        <div class="platform-logo zomato-logo">
                            Z
                        </div>

                        <div class="platform-name">
                            Zomato
                        </div>

                    </div>


                    <div class="food-info">

                        <div class="food-name">
                            ${capitalize(searchTerm)}
                        </div>

                        <div class="restaurant-name">
                            📍 ${foodData.zomato.restaurant}
                        </div>

                    </div>


                    <div class="info-row">

                        <span class="info-label">
                            ⭐ Rating
                        </span>

                        <span class="info-value rating">
                            ★ ${foodData.zomato.rating}/5
                        </span>

                    </div>


                    <div class="info-row">

                        <span class="info-label">
                            💰 Price
                        </span>

                        <span class="info-value price">
                            ₹${foodData.zomato.price}
                        </span>

                    </div>


                    <div class="info-row">

                        <span class="info-label">
                            🏆 Quality
                        </span>

                        <span class="info-value">

                            ${getQualityBadge(
                                foodData.zomato.quality
                            )}

                        </span>

                    </div>


                    <div class="info-row">

                        <span class="info-label">
                            🚚 Delivery
                        </span>

                        <span class="info-value">
                            ${foodData.zomato.deliveryTime} min
                        </span>

                    </div>


                    <div class="info-row">

                        <span class="info-label">
                            📝 Reviews
                        </span>

                        <span class="info-value">
                            ${foodData.zomato.reviews.toLocaleString()}
                        </span>

                    </div>


                    <div class="info-row">

                        <span class="info-label">
                            📌 Location
                        </span>

                        <span class="info-value">

                            ${location.area},
                            ${location.city}

                        </span>

                    </div>


                    <button
                        class="order-btn"
                        onclick="orderFood(
                            '${foodData.zomato.orderUrl}',
                            'Zomato'
                        )"
                    >

                        🛒 Order from Zomato

                    </button>

                </div>


                <!-- SWIGGY -->

                <div class="platform-card swiggy-card">

                    <div class="platform-header">

                        <div class="platform-logo swiggy-logo">
                            S
                        </div>

                        <div class="platform-name">
                            Swiggy
                        </div>

                    </div>


                    <div class="food-info">

                        <div class="food-name">
                            ${capitalize(searchTerm)}
                        </div>

                        <div class="restaurant-name">
                            📍 ${foodData.swiggy.restaurant}
                        </div>

                    </div>


                    <div class="info-row">

                        <span class="info-label">
                            ⭐ Rating
                        </span>

                        <span class="info-value rating">
                            ★ ${foodData.swiggy.rating}/5
                        </span>

                    </div>


                    <div class="info-row">

                        <span class="info-label">
                            💰 Price
                        </span>

                        <span class="info-value price">
                            ₹${foodData.swiggy.price}
                        </span>

                    </div>


                    <div class="info-row">

                        <span class="info-label">
                            🏆 Quality
                        </span>

                        <span class="info-value">

                            ${getQualityBadge(
                                foodData.swiggy.quality
                            )}

                        </span>

                    </div>


                    <div class="info-row">

                        <span class="info-label">
                            🚚 Delivery
                        </span>

                        <span class="info-value">
                            ${foodData.swiggy.deliveryTime} min
                        </span>

                    </div>


                    <div class="info-row">

                        <span class="info-label">
                            📝 Reviews
                        </span>

                        <span class="info-value">
                            ${foodData.swiggy.reviews.toLocaleString()}
                        </span>

                    </div>


                    <div class="info-row">

                        <span class="info-label">
                            📌 Location
                        </span>

                        <span class="info-value">

                            ${location.area},
                            ${location.city}

                        </span>

                    </div>


                    <button
                        class="order-btn"
                        onclick="orderFood(
                            '${foodData.swiggy.orderUrl}',
                            'Swiggy'
                        )"
                    >

                        🛒 Order from Swiggy

                    </button>

                </div>

            </div>


            <!-- WINNER -->

            <div class="winner-section">

                <div class="winner-title">

                    🏆 Comparison for
                    ${location.area},
                    ${location.city}

                </div>


                <div class="winner-content">

                    <div class="trophy">
                        🏆
                    </div>


                    <div class="winner-card">

                        ${
                            winner === 'zomato'
                                ? 'Zomato'
                                : 'Swiggy'
                        }

                        has the better overall combination
                        based on the stored comparison data.

                    </div>

                </div>

            </div>

        `;


        // =================================================
        // UPDATE SAVE BUTTON
        // =================================================

        updateFavoriteButton();

    }

    catch (error) {

        console.error(
            'Food search error:',
            error
        );

        resultsDiv.innerHTML = `

            <div class="no-results">

                <div class="no-results-icon">
                    ❌
                </div>

                <div class="no-results-text">
                    ${error.message}
                </div>

            </div>

        `;
    }
}


// =====================================================
// CAPITALIZE
// =====================================================

function capitalize(text) {

    return text
        .split(' ')
        .map(function (word) {

            if (!word) return '';

            return (
                word.charAt(0).toUpperCase() +
                word.slice(1)
            );

        })
        .join(' ');
}


// =====================================================
// QUICK SEARCH
// =====================================================

function quickSearch(food) {

    const foodSearch =
        document.getElementById(
            'foodSearch'
        );

    if (!foodSearch) return;

    foodSearch.value = food;

    searchFood();
}


// =====================================================
// ENTER KEY
// =====================================================

document.addEventListener(
    'DOMContentLoaded',
    function () {

        populateStates();

        const foodSearch =
            document.getElementById(
                'foodSearch'
            );

        if (foodSearch) {

            foodSearch.addEventListener(
                'keypress',
                function (e) {

                    if (e.key === 'Enter') {
                        searchFood();
                    }

                }
            );
        }

    }
);


// =====================================================
// BOTTOM NAVIGATION
// =====================================================

function goHome() {

    window.location.href =
        'food.html';
}


function goOrders() {

    window.location.href =
        'orders.html';
}


function goSaved() {

    window.location.href =
        'saved.html';
}


function goProfile() {

    window.location.href =
        'profile.html';
}
// ========================================
// FOOD SEARCH SUGGESTIONS
// ========================================

const foodSuggestionList = [
    'Biryani',
    'Chicken Biryani',
    'Mutton Biryani',
    'Egg Biryani',
    'Veg Biryani',
    'Pizza',
    'Burger',
    'Dosa',
    'Masala Dosa',
    'Plain Dosa',
    'Rava Dosa',
    'Onion Dosa',
    'Idly',
    'Vada',
    'Pongal',
    'Poori',
    'Parotta',
    'Kothu Parotta',
    'Fried Rice',
    'Chicken Fried Rice',
    'Egg Fried Rice',
    'Veg Fried Rice',
    'Chicken Noodles',
    'Egg Noodles',
    'Veg Noodles',
    'Momos',
    'Pasta',
    'Shawarma',
    'French Fries',
    'Sandwich',
    'Grilled Sandwich',
    'Wrap',
    'Taco',
    'Chicken 65',
    'Chicken Tikka',
    'Tandoori Chicken',
    'Grill Chicken',
    'Chicken Kebab',
    'Chicken Curry',
    'Mutton Curry',
    'Fish Fry',
    'Fish Curry',
    'Prawn Fry',
    'Paneer Butter Masala',
    'Samosa',
    'Bajji',
    'Tea',
    'Coffee',
    'Cold Coffee',
    'Filter Coffee',
    'Milkshake',
    'Chocolate Milkshake',
    'Strawberry Milkshake',
    'Mango Milkshake',
    'Oreo Milkshake',
    'Fresh Lime Juice',
    'Lemon Juice',
    'Orange Juice',
    'Watermelon Juice',
    'Mango Juice',
    'Apple Juice',
    'Pomegranate Juice',
    'Mojito',
    'Virgin Mojito',
    'Lassi',
    'Sweet Lassi',
    'Buttermilk',
    'Falooda',
    'Bubble Tea',
    'Gulab Jamun',
    'Rasgulla',
    'Brownie',
    'Chocolate Cake',
    'Red Velvet Cake',
    'Ice Cream',
    'Chocolate Ice Cream',
    'Vanilla Ice Cream',
    'Strawberry Ice Cream',
    'Kulfi',
    'Gajar Halwa',
    'Carrot Cake',
    'Cheesecake'
];


// ========================================
// SHOW FOOD SUGGESTIONS
// ========================================

function showFoodSuggestions(searchText) {

    const suggestionsBox =
        document.getElementById('foodSuggestions');

    if (!suggestionsBox) return;

    const text =
        searchText.toLowerCase().trim();

    if (!text) {
        suggestionsBox.style.display = 'none';
        suggestionsBox.innerHTML = '';
        return;
    }

    const matches =
        foodSuggestionList
            .filter(function(food) {
                return food.toLowerCase().includes(text);
            })
            .slice(0, 8);

    if (matches.length === 0) {
        suggestionsBox.style.display = 'none';
        suggestionsBox.innerHTML = '';
        return;
    }

    suggestionsBox.innerHTML = '';

    matches.forEach(function(food) {

        const item =
            document.createElement('div');

        item.className =
            'food-suggestion-item';

        item.innerHTML =
            '🍽️ ' + food;

        item.onclick = function() {

            document.getElementById(
                'foodSearch'
            ).value = food;

            suggestionsBox.style.display = 'none';

        };

        suggestionsBox.appendChild(item);

    });

    suggestionsBox.style.display = 'block';
}


// ========================================
// FOOD SEARCH INPUT
// ========================================

document.addEventListener(
    'DOMContentLoaded',
    function() {

        const foodSearch =
            document.getElementById('foodSearch');

        if (!foodSearch) return;

        foodSearch.addEventListener(
            'input',
            function() {

                showFoodSuggestions(
                    foodSearch.value
                );

            }
        );


        foodSearch.addEventListener(
            'focus',
            function() {

                if (foodSearch.value.trim()) {

                    showFoodSuggestions(
                        foodSearch.value
                    );

                }

            }
        );

    }
);


// ========================================
// HIDE SUGGESTIONS WHEN CLICKING OUTSIDE
// ========================================

document.addEventListener(
    'click',
    function(event) {

        const searchBox =
            document.querySelector('.search-box');

        const suggestionsBox =
            document.getElementById('foodSuggestions');

        if (
            searchBox &&
            suggestionsBox &&
            !searchBox.contains(event.target)
        ) {

            suggestionsBox.style.display =
                'none';

        }

    }
);