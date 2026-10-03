// ================================
// ADMIN AUTHENTICATION
// ================================

const adminToken = localStorage.getItem('adminToken');

if (!adminToken) {
    // No admin login → go to main login page
    window.location.href = 'login-simple.html';
}


// ================================
// GLOBAL VARIABLES
// ================================

let allOrders = [];
let filteredOrders = [];


// ================================
// ADMIN LOGOUT
// ================================

function adminLogout() {

    if (confirm('Are you sure you want to logout?')) {

        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUsername');
        localStorage.removeItem('adminRole');

        // Go back to the combined login page
        window.location.href = 'login-simple.html';
    }
}


// ================================
// LOAD ORDERS
// ================================

async function loadOrders() {

    try {

        const response = await fetch(
            'https://smartfoodcomparebackend-production.up.railway.app/api/admin/orders',
            {
                headers: {
                    'Authorization': `Bearer ${adminToken}`
                }
            }
        );

        if (!response.ok) {

            if (response.status === 401 || response.status === 403) {

                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminUsername');
                localStorage.removeItem('adminRole');

                alert('Admin session expired. Please login again.');

                window.location.href = 'login-simple.html';

                return;
            }

            throw new Error('Failed to load orders');
        }

        const data = await response.json();

        allOrders = data.orders || [];
        filteredOrders = [...allOrders];

        updateStatistics();
        displayOrders();

    } catch (error) {

        console.error('Error loading orders:', error);

        // If backend API is not available,
        // show empty order list instead of crashing.

        allOrders = [];
        filteredOrders = [];

        updateStatistics();
        displayOrders();
    }
}


// ================================
// UPDATE STATISTICS
// ================================

function updateStatistics() {

    const totalOrders = allOrders.length;

    const uniqueUsers = [
        ...new Set(
            allOrders.map(order => order.userEmail)
        )
    ].length;

    const zomatoOrders =
        allOrders.filter(
            order => order.platform === 'zomato'
        ).length;

    const swiggyOrders =
        allOrders.filter(
            order => order.platform === 'swiggy'
        ).length;


    document.getElementById('totalOrders').textContent =
        totalOrders;

    document.getElementById('totalUsers').textContent =
        uniqueUsers;

    document.getElementById('zomatoOrders').textContent =
        zomatoOrders;

    document.getElementById('swiggyOrders').textContent =
        swiggyOrders;
}


// ================================
// DISPLAY ORDERS
// ================================

function displayOrders() {

    const tbody =
        document.getElementById('ordersTableBody');

    if (!tbody) {
        return;
    }

    if (filteredOrders.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="no-data">
                    No orders found
                </td>
            </tr>
        `;

        return;
    }


    tbody.innerHTML = filteredOrders
        .sort(
            (a, b) =>
                new Date(b.timestamp) -
                new Date(a.timestamp)
        )
        .map((order, index) => {

            return `
                <tr>

                    <td>${index + 1}</td>

                    <td>
                        <strong>
                            ${order.orderId || '-'}
                        </strong>
                    </td>

                    <td>
                        ${order.userEmail || '-'}
                    </td>

                    <td>
                        ${order.foodItem || '-'}
                    </td>

                    <td>

                        <span class="platform-badge ${order.platform}-badge">

                            ${
                                order.platform === 'zomato'
                                    ? 'Zomato'
                                    : 'Swiggy'
                            }

                        </span>

                    </td>

                    <td class="price-value">
                        ₹${order.price || '-'}
                    </td>

                    <td>
                        ${order.location || '-'}
                    </td>

                    <td>
                        ${
                            order.timestamp
                                ? formatDate(order.timestamp)
                                : '-'
                        }
                    </td>

                </tr>
            `;

        })
        .join('');
}


// ================================
// FORMAT DATE
// ================================

function formatDate(timestamp) {

    const date = new Date(timestamp);

    const options = {

        year: 'numeric',

        month: 'short',

        day: '2-digit',

        hour: '2-digit',

        minute: '2-digit',

        hour12: true
    };

    return date.toLocaleDateString(
        'en-IN',
        options
    );
}


// ================================
// FILTER ORDERS
// ================================

function filterOrders() {

    const platformFilter =
        document.getElementById('platformFilter').value;

    const searchUser =
        document
            .getElementById('searchUser')
            .value
            .toLowerCase();


    filteredOrders = allOrders.filter(order => {

        const matchesPlatform =
            platformFilter === 'all' ||
            order.platform === platformFilter;

        const matchesUser =
            (order.userEmail || '')
                .toLowerCase()
                .includes(searchUser);

        return matchesPlatform && matchesUser;

    });


    displayOrders();
}


// ================================
// DOWNLOAD CSV
// ================================

function downloadCSV() {

    if (allOrders.length === 0) {

        alert('No orders to download!');

        return;
    }


    const headers = [

        'Order ID',
        'User Email',
        'Food Item',
        'Platform',
        'Restaurant',
        'Price',
        'Rating',
        'Delivery Time',
        'Location',
        'Date & Time'

    ];


    const rows = allOrders.map(order => [

        order.orderId || '',

        order.userEmail || '',

        order.foodItem || '',

        order.platform === 'zomato'
            ? 'Zomato'
            : 'Swiggy',

        order.restaurant || '',

        order.price || '',

        order.rating || '',

        order.deliveryTime
            ? `${order.deliveryTime} min`
            : '',

        order.location || '',

        order.timestamp
            ? formatDate(order.timestamp)
            : ''

    ]);


    const csvContent = [

        headers.join(','),

        ...rows.map(row =>
            row
                .map(cell =>
                    `"${String(cell).replace(/"/g, '""')}"`
                )
                .join(',')
        )

    ].join('\n');


    const blob = new Blob(

        [csvContent],

        {
            type: 'text/csv;charset=utf-8;'
        }

    );


    const link =
        document.createElement('a');

    const url =
        URL.createObjectURL(blob);


    const timestamp =
        new Date()
            .toISOString()
            .split('T')[0];


    link.href = url;

    link.download =
        `food-orders-${timestamp}.csv`;

    link.style.display = 'none';


    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);


    alert(
        `Successfully downloaded ${allOrders.length} orders!`
    );
}


// ================================
// CLEAR ALL ORDERS
// ================================

function clearAllOrders() {

    if (allOrders.length === 0) {

        alert('No orders to clear!');

        return;
    }


    const confirmMsg =
        `Are you sure you want to delete all ${allOrders.length} orders?`;


    if (!confirm(confirmMsg)) {
        return;
    }


    allOrders = [];

    filteredOrders = [];

    updateStatistics();

    displayOrders();

    alert('Orders cleared from the current view.');
}


// ================================
// PAGE INITIALIZATION
// ================================

document.addEventListener(
    'DOMContentLoaded',
    function () {

        loadOrders();

        // Refresh every 30 seconds
        setInterval(
            loadOrders,
            30000
        );

    }
);