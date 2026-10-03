const API_BASE = window.location.origin + '/api';

async function handleAdminLogin(event) {
    event.preventDefault();
    const username = document.getElementById('adminUsername').value.trim();
    const password = document.getElementById('adminPassword').value;
    const button = event.target.querySelector('button[type="submit"]');
    button.disabled = true;
    button.textContent = 'Logging in...';

    try {
        const response = await fetch(API_BASE + '/auth/admin-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Admin login failed');

        localStorage.setItem('authToken', data.token);
        localStorage.setItem('isAdminLoggedIn', 'true');
        localStorage.setItem('userEmail', data.user.email);
        localStorage.removeItem('isLoggedIn');
        window.location.replace('admin-panel.html');
    } catch (error) {
        alert(error.message);
        button.disabled = false;
        button.textContent = 'Login to Admin Panel';
    }
}

if (localStorage.getItem('authToken') && localStorage.getItem('isAdminLoggedIn') === 'true') {
    window.location.replace('admin-panel.html');
}
