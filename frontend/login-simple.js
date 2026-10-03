const API_BASE = 'https://smartfoodcomparebackend-production.up.railway.app/api';

/* =========================
   USER LOGIN
========================= */

async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
        alert('Please enter email and password');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        console.log('Login response:', data);

        if (!response.ok) {
            alert(data.message || 'Login failed');
            return;
        }

        /* IMPORTANT:
           Save token using authToken
           because food.js uses authToken
        */
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('userRole', data.user.role);
        localStorage.setItem('isLoggedIn', 'true');

        // Go to food page
        window.location.href = 'food.html';

    } catch (error) {
        console.error('Login error:', error);

        alert(
            'Cannot connect to backend.\n' +
            'Please make sure the server is running.'
        );
    }
}


/* =========================
   ADMIN LOGIN
========================= */

async function handleAdminLogin(event) {
    event.preventDefault();

    const username = document
        .getElementById('adminUsername')
        .value.trim();

    const password = document
        .getElementById('adminPassword')
        .value;

    if (!username || !password) {
        alert('Please enter admin username and password');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/auth/admin-login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        const data = await response.json();

        console.log('Admin login response:', data);

        if (!response.ok) {
            alert(data.message || 'Admin login failed');
            return;
        }

        localStorage.setItem('authToken', data.token);
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUsername', username);
        localStorage.setItem('adminRole', data.user.role);
        localStorage.setItem('isAdminLoggedIn', 'true');

        window.location.href = 'admin-panel.html';

    } catch (error) {
        console.error('Admin login error:', error);

        alert(
            'Cannot connect to backend.\n' +
            'Please make sure the server is running.'
        );
    }
}


/* =========================
   USER / ADMIN SWITCH
========================= */

function showUserLogin() {
    document.getElementById('userLoginSection').style.display = 'block';
    document.getElementById('adminLoginSection').style.display = 'none';

    const buttons = document.querySelectorAll('.switch-btn');

    buttons[0].classList.add('active');
    buttons[1].classList.remove('active');
}


function showAdminLogin() {
    document.getElementById('userLoginSection').style.display = 'none';
    document.getElementById('adminLoginSection').style.display = 'block';

    const buttons = document.querySelectorAll('.switch-btn');

    buttons[0].classList.remove('active');
    buttons[1].classList.add('active');
}


/* =========================
   PAGE LOAD
========================= */

document.addEventListener('DOMContentLoaded', function () {

    const loginForm = document.getElementById('loginForm');
    const adminLoginForm = document.getElementById('adminLoginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', handleAdminLogin);
    }

    console.log('Login page loaded successfully');
});