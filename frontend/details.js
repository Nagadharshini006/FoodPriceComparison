const API_BASE = 'https://smartfoodcomparebackend-production.up.railway.app/api';
const foodData = JSON.parse(sessionStorage.getItem('foodData') || 'null');
const foodName = sessionStorage.getItem('foodName');
const location = JSON.parse(sessionStorage.getItem('location') || 'null');
let orderInProgress = false;

if (!localStorage.getItem('authToken') || !foodData || !foodName || !location) {
    alert('Session data is missing. Redirecting to search page.');
    window.location.replace('food.html');
}

function authHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('authToken')
    };
}

function determineWinner(zomato, swiggy) {
    const score = p => (Number(p.rating) * 0.4) + ((500 - Number(p.price)) / 500 * 0.3) +
        (p.quality === 'best' ? 0.3 : p.quality === 'good' ? 0.15 : 0);
    return score(zomato) > score(swiggy) ? 'zomato' : 'swiggy';
}

window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('foodTitle').textContent = foodName.charAt(0).toUpperCase() + foodName.slice(1);
    document.getElementById('locationInfo').textContent = `📍 ${location.area}, ${location.city}, ${location.state}`;

    const z = foodData.zomato;
    const s = foodData.swiggy;
    document.getElementById('zomatoRestaurant').textContent = z.restaurant;
    document.getElementById('zomatoArea').textContent = `${location.area}, ${location.city}`;
    document.getElementById('zomatoRating').textContent = `${z.rating}/5`;
    document.getElementById('zomatoPrice').textContent = `₹${z.price}`;
    document.getElementById('zomatoQuality').textContent = String(z.quality).toUpperCase();
    document.getElementById('zomatoDelivery').textContent = `${z.deliveryTime} min`;
    document.getElementById('zomatoReviews').textContent = Number(z.reviews).toLocaleString();

    document.getElementById('swiggyRestaurant').textContent = s.restaurant;
    document.getElementById('swiggyArea').textContent = `${location.area}, ${location.city}`;
    document.getElementById('swiggyRating').textContent = `${s.rating}/5`;
    document.getElementById('swiggyPrice').textContent = `₹${s.price}`;
    document.getElementById('swiggyQuality').textContent = String(s.quality).toUpperCase();
    document.getElementById('swiggyDelivery').textContent = `${s.deliveryTime} min`;
    document.getElementById('swiggyReviews').textContent = Number(s.reviews).toLocaleString();

    const winner = determineWinner(z, s);
    const winnerPlatform = winner === 'zomato' ? 'Zomato' : 'Swiggy';
    document.getElementById('winnerTitle').textContent = `${winnerPlatform} Offers the Best Deal!`;

    const p = winner === 'zomato' ? z : s;
    const other = winner === 'zomato' ? s : z;
    const reasons = [];
    if (p.price < other.price) reasons.push('lower price');
    if (p.rating > other.rating) reasons.push('better rating');
    if (p.deliveryTime < other.deliveryTime) reasons.push('faster delivery');
    document.getElementById('winnerReason').textContent = reasons.length
        ? `Best value with: ${reasons.join(', ')}`
        : 'Best overall combination of price, rating, and quality';
});

function goBack() { window.location.replace('food.html'); }

async function orderFrom(platform) {
    if (orderInProgress) return;
    orderInProgress = true;
    try {
        const response = await fetch(API_BASE + '/orders', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ foodName, platform, foodData, location })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Could not save order');

        const selected = foodData[platform];
        // The URL contains the selected food + chosen area/city. The external platform may still
        // apply the location saved in the user's platform account, so exact restaurant routing
        // requires an official platform API/deep link.
        const url = platform === 'zomato'
            ? 'https://www.zomato.com/search?q=' + encodeURIComponent(`${foodName} ${location.area} ${location.city}`)
            : 'https://www.swiggy.com/search?query=' + encodeURIComponent(`${foodName} ${location.area} ${location.city}`);
        window.open(url, '_blank');
    } catch (error) {
        alert(error.message);
    } finally {
        setTimeout(() => { orderInProgress = false; }, 800);
    }
}
