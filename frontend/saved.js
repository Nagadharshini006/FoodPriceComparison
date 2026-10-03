// ================================
// SAVED COMPARISONS
// ================================

const API_BASE = 'https://smartfoodcomparebackend-production.up.railway.app/api';


// ================================
// AUTH HEADERS
// ================================

function authHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('authToken')
    };
}


// ================================
// LOAD SAVED COMPARISONS
// ================================

async function loadSavedComparisons() {

    const container = document.getElementById('savedComparisons');

    if (!container) {
        console.error('savedComparisons element not found');
        return;
    }

    const token = localStorage.getItem('authToken');

    if (!token) {
        window.location.href = 'login-simple.html';
        return;
    }

    // Loading message
    container.innerHTML = `
        <div class="no-saved">
            <div class="no-saved-icon">🔄</div>
            <h3>Loading saved comparisons...</h3>
        </div>
    `;

    try {

        const response = await fetch(
            API_BASE + '/comparisons/saved',
            {
                method: 'GET',
                headers: authHeaders()
            }
        );

        const data = await response.json();

        console.log('Saved comparisons:', data);

        if (!response.ok) {
            throw new Error(
                data.message || 'Could not load saved comparisons'
            );
        }

        // No saved comparisons
        if (!data || data.length === 0) {

            container.innerHTML = `
                <div class="no-saved">
                    <div class="no-saved-icon">💾</div>

                    <h3>No saved comparisons yet</h3>

                    <p>
                        Compare a food and save the comparison
                        to see it here.
                    </p>

                    <button onclick="goHome()">
                        🔍 Compare Food
                    </button>
                </div>
            `;

            return;
        }

        // Display saved comparisons
        container.innerHTML = data.map(function (item) {

            const winner =
                item.winner
                    ? capitalize(item.winner)
                    : 'Comparison';

            return `
                <div class="saved-card">

                    <div class="saved-card-header">

                        <div>
                            <h3>
                                🍽️ ${capitalize(item.foodName)}
                            </h3>

                            <p class="saved-location">
                                📍 ${item.area},
                                ${item.city},
                                ${item.state}
                            </p>
                        </div>

                        <div class="saved-date">
                            ${formatDate(item.createdAt)}
                        </div>

                    </div>


                    <div class="saved-platforms">

                        <!-- ZOMATO -->

                        <div class="saved-platform zomato">

                            <h4>🔴 Zomato</h4>

                            <p>
                                <strong>
                                    ${item.zomatoRestaurant || '-'}
                                </strong>
                            </p>

                            <p>
                                ⭐ ${item.zomatoRating || '-'}
                            </p>

                            <p>
                                💰 ₹${item.zomatoPrice || '-'}
                            </p>

                            <p>
                                🚚 ${item.zomatoDelivery || '-'} min
                            </p>

                        </div>


                        <!-- SWIGGY -->

                        <div class="saved-platform swiggy">

                            <h4>🟠 Swiggy</h4>

                            <p>
                                <strong>
                                    ${item.swiggyRestaurant || '-'}
                                </strong>
                            </p>

                            <p>
                                ⭐ ${item.swiggyRating || '-'}
                            </p>

                            <p>
                                💰 ₹${item.swiggyPrice || '-'}
                            </p>

                            <p>
                                🚚 ${item.swiggyDelivery || '-'} min
                            </p>

                        </div>

                    </div>


                    <div class="saved-winner">

                        🏆 Better Overall:
                        <strong>${winner}</strong>

                    </div>

                </div>
            `;

        }).join('');

    }

    catch (error) {

        console.error(
            'Saved comparison error:',
            error
        );

        container.innerHTML = `
            <div class="no-saved">

                <div class="no-saved-icon">❌</div>

                <h3>Could not load saved comparisons</h3>

                <p>
                    ${error.message}
                </p>

                <button onclick="loadSavedComparisons()">
                    🔄 Try Again
                </button>

            </div>
        `;
    }
}


// ================================
// CAPITALIZE
// ================================

function capitalize(text) {

    if (!text) {
        return '';
    }

    return text
        .split(' ')
        .map(function (word) {

            return word.charAt(0).toUpperCase()
                + word.slice(1);

        })
        .join(' ');
}


// ================================
// FORMAT DATE
// ================================

function formatDate(dateString) {

    if (!dateString) {
        return '';
    }

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
        return '';
    }

    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}


// ================================
// GO HOME
// ================================

function goHome() {

    window.location.href = 'food.html';

}


// ================================
// PAGE LOAD
// ================================

document.addEventListener(
    'DOMContentLoaded',
    function () {

        loadSavedComparisons();

    }
);