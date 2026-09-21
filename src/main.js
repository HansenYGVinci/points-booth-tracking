// All data access goes through our API (server/index.js on Render).
// No Supabase keys exist in this bundle.

async function api(path, options = {}) {
    const res = await fetch(path, {
        headers: { 'Content-Type': 'application/json' },
        ...options
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        const err = new Error(data.error || 'Request failed. Please try again.');
        err.status = res.status;
        throw err;
    }
    return data;
}

// Current user state
let currentUser = null;
let currentUserRole = null;
let currentAdminData = null;
let userPoll = null;

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const signupScreen = document.getElementById('signupScreen');
const userDashboard = document.getElementById('userDashboard');
const adminDashboard = document.getElementById('adminDashboard');
const userIdInput = document.getElementById('userId');
const loginBtn = document.getElementById('loginBtn');
const loginError = document.getElementById('loginError');
const signupUserIdInput = document.getElementById('signupUserId');
const signupBtn = document.getElementById('signupBtn');
const signupError = document.getElementById('signupError');

// Switch between login and signup screens
document.getElementById('showSignupLink').addEventListener('click', () => {
    loginScreen.classList.add('hidden');
    signupScreen.classList.remove('hidden');
});

document.getElementById('showLoginLink').addEventListener('click', () => {
    signupScreen.classList.add('hidden');
    loginScreen.classList.remove('hidden');
});

// Login handler
loginBtn.addEventListener('click', async () => {
    const userId = userIdInput.value.trim();

    if (!userId || !/^\d{8}$/.test(userId)) {
        showError(loginError, 'Please enter a valid 8-digit ID');
        return;
    }

    try {
        const result = await api('/api/login', {
            method: 'POST',
            body: JSON.stringify({ id: userId })
        });

        currentUser = userId;

        if (result.type === 'admin') {
            currentUserRole = 'admin';
            currentAdminData = { type: result.adminType, name: result.name };
            loginScreen.classList.add('hidden');
            showAdminDashboard(userId);
        } else {
            currentUserRole = 'user';
            loginScreen.classList.add('hidden');
            showUserDashboard(userId, result.user);
        }

    } catch (error) {
        console.error('Login error:', error);
        showError(loginError, error.message);
    }
});

// Signup handler
signupBtn.addEventListener('click', async () => {
    const userId = signupUserIdInput.value.trim();

    if (!userId || !/^\d{8}$/.test(userId)) {
        showError(signupError, 'Please enter a valid 8-digit ID');
        return;
    }

    try {
        const result = await api('/api/signup', {
            method: 'POST',
            body: JSON.stringify({ id: userId })
        });

        // Sign up and go straight to the user dashboard
        currentUserRole = 'user';
        currentUser = userId;
        signupScreen.classList.add('hidden');
        showUserDashboard(userId, result.user);

    } catch (error) {
        console.error('Signup error:', error);
        showError(signupError, error.message);
    }
});

// Show error message
function showError(element, message) {
    element.textContent = message;
    element.classList.remove('hidden');
    setTimeout(() => {
        element.classList.add('hidden');
    }, 3000);
}

// User Dashboard
function showUserDashboard(userId, userData) {
    userDashboard.classList.remove('hidden');
    document.getElementById('userDisplayId').textContent = userId;

    if (userData) updateUserDashboard(userData);

    // Poll for updates (admin actions reflect within a few seconds)
    userPoll = setInterval(async () => {
        try {
            const user = await api(`/api/users/${userId}`);
            updateUserDashboard(user);
        } catch (error) {
            console.error('Error refreshing user data:', error);
        }
    }, 3000);
}

function updateUserDashboard(data) {
    document.getElementById('userPoints').textContent = data.points_count || 0;

    updateBoothBadge('userBooth1', data.booth_1);
    updateBoothBadge('userBooth2', data.booth_2);
    updateBoothBadge('userBooth3', data.booth_3);
}

function updateBoothBadge(elementId, status) {
    const element = document.getElementById(elementId);
    if (status) {
        element.textContent = '✓ Complete';
        element.className = 'px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800';
    } else {
        element.textContent = 'Pending';
        element.className = 'px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600';
    }
}

// User logout
document.getElementById('userLogoutBtn').addEventListener('click', () => {
    if (userPoll) {
        clearInterval(userPoll);
        userPoll = null;
    }
    logout();
});

// Admin Dashboard
function showAdminDashboard(userId) {
    adminDashboard.classList.remove('hidden');
    document.getElementById('adminWelcome').textContent = `Welcome, ${currentAdminData.name}`;

    // Setup tab switching
    setupAdminTabs();
}

function setupAdminTabs() {
    const tabBooth = document.getElementById('tabBooth');
    const tabPurchase = document.getElementById('tabPurchase');
    const boothManagementTab = document.getElementById('boothManagementTab');
    const purchaseTab = document.getElementById('purchaseTab');

    tabBooth.addEventListener('click', () => {
        tabBooth.classList.add('border-indigo-600', 'text-indigo-600');
        tabBooth.classList.remove('border-transparent', 'text-gray-500');
        tabPurchase.classList.remove('border-indigo-600', 'text-indigo-600');
        tabPurchase.classList.add('border-transparent', 'text-gray-500');
        boothManagementTab.classList.remove('hidden');
        purchaseTab.classList.add('hidden');
    });

    tabPurchase.addEventListener('click', () => {
        tabPurchase.classList.add('border-indigo-600', 'text-indigo-600');
        tabPurchase.classList.remove('border-transparent', 'text-gray-500');
        tabBooth.classList.remove('border-indigo-600', 'text-indigo-600');
        tabBooth.classList.add('border-transparent', 'text-gray-500');
        purchaseTab.classList.remove('hidden');
        boothManagementTab.classList.add('hidden');
    });

    // Booth management search
    document.getElementById('searchBtn').addEventListener('click', () => handleBoothSearch());

    // Purchase search
    document.getElementById('purchaseSearchBtn').addEventListener('click', () => handlePurchaseSearch());

    // Booth toggle buttons
    setupBoothToggles();

    // Purchase processing
    document.getElementById('processPurchaseBtn').addEventListener('click', handleProcessPurchase);
}

function setupBoothToggles() {
    const toggleBooth1 = document.getElementById('toggleBooth1');
    const toggleBooth2 = document.getElementById('toggleBooth2');
    const toggleBooth3 = document.getElementById('toggleBooth3');

    // Hide/disable buttons based on admin role
    if (currentAdminData.type === 'booth1') {
        toggleBooth2.style.display = 'none';
        toggleBooth3.style.display = 'none';
    } else if (currentAdminData.type === 'booth2') {
        toggleBooth1.style.display = 'none';
        toggleBooth3.style.display = 'none';
    } else if (currentAdminData.type === 'booth3') {
        toggleBooth1.style.display = 'none';
        toggleBooth2.style.display = 'none';
    }
    // Super admin can see all buttons

    toggleBooth1.addEventListener('click', () => handleBoothToggle('booth_1'));
    toggleBooth2.addEventListener('click', () => handleBoothToggle('booth_2'));
    toggleBooth3.addEventListener('click', () => handleBoothToggle('booth_3'));
}

async function handleBoothSearch() {
    const searchUserId = document.getElementById('searchUserId').value.trim();
    const searchError = document.getElementById('searchError');
    const searchResults = document.getElementById('searchResults');

    if (!searchUserId || !/^\d{8}$/.test(searchUserId)) {
        showError(searchError, 'Please enter a valid 8-digit ID');
        return;
    }

    try {
        const user = await api(`/api/users/${searchUserId}`);
        displayBoothSearchResults(searchUserId, user);
        searchResults.classList.remove('hidden');
        searchError.classList.add('hidden');

    } catch (error) {
        console.error('Search error:', error);
        if (error.status === 404) {
            showError(searchError, 'User not found');
            searchResults.classList.add('hidden');
        } else {
            showError(searchError, 'Search failed. Please try again.');
        }
    }
}

function displayBoothSearchResults(userId, data) {
    document.getElementById('resultUserId').textContent = userId;
    document.getElementById('resultPoints').textContent = data.points_count || 0;

    updateBoothBadge('resultBooth1', data.booth_1);
    updateBoothBadge('resultBooth2', data.booth_2);
    updateBoothBadge('resultBooth3', data.booth_3);

    // Store current searched user for toggle operations
    window.currentSearchedUser = userId;
}

async function handleBoothToggle(boothField) {
    const userId = window.currentSearchedUser;
    if (!userId) return;

    try {
        const user = await api(`/api/users/${userId}/booth`, {
            method: 'POST',
            body: JSON.stringify({ booth: boothField })
        });
        displayBoothSearchResults(userId, user);

    } catch (error) {
        console.error('Toggle error:', error);
        alert(error.message || 'Failed to update booth status. Please try again.');
    }
}

async function handlePurchaseSearch() {
    const searchUserId = document.getElementById('purchaseSearchUserId').value.trim();
    const searchError = document.getElementById('purchaseSearchError');
    const purchaseResults = document.getElementById('purchaseResults');

    if (!searchUserId || !/^\d{8}$/.test(searchUserId)) {
        showError(searchError, 'Please enter a valid 8-digit ID');
        return;
    }

    try {
        const user = await api(`/api/users/${searchUserId}`);
        displayPurchaseResults(searchUserId, user);
        purchaseResults.classList.remove('hidden');
        searchError.classList.add('hidden');

    } catch (error) {
        console.error('Search error:', error);
        if (error.status === 404) {
            showError(searchError, 'User not found');
            purchaseResults.classList.add('hidden');
        } else {
            showError(searchError, 'Search failed. Please try again.');
        }
    }
}

function displayPurchaseResults(userId, data) {
    document.getElementById('purchaseResultUserId').textContent = userId;
    document.getElementById('purchaseResultPoints').textContent = data.points_count || 0;
    document.getElementById('purchaseResultBooth1').textContent = data.booth_1 ? '✓ Complete' : 'Pending';
    document.getElementById('purchaseResultBooth2').textContent = data.booth_2 ? '✓ Complete' : 'Pending';
    document.getElementById('purchaseResultBooth3').textContent = data.booth_3 ? '✓ Complete' : 'Pending';

    const purchaseWarning = document.getElementById('purchaseWarning');
    const purchaseForm = document.getElementById('purchaseForm');

    // Check eligibility
    if (data.booth_1 && data.booth_2 && data.booth_3) {
        purchaseWarning.classList.add('hidden');
        purchaseForm.classList.remove('hidden');
    } else {
        purchaseWarning.classList.remove('hidden');
        purchaseForm.classList.add('hidden');
    }

    window.currentPurchaseUser = userId;
}

async function handleProcessPurchase() {
    const userId = window.currentPurchaseUser;
    const pointsToDeduct = parseInt(document.getElementById('pointsToDeduct').value);

    if (!userId) {
        alert('Please search for a user first');
        return;
    }

    if (!pointsToDeduct || pointsToDeduct <= 0) {
        alert('Please enter a valid point amount');
        return;
    }

    try {
        const user = await api(`/api/users/${userId}/purchase`, {
            method: 'POST',
            body: JSON.stringify({ points: pointsToDeduct })
        });

        alert(`Successfully deducted ${pointsToDeduct} points`);
        document.getElementById('pointsToDeduct').value = '';
        displayPurchaseResults(userId, user);

    } catch (error) {
        console.error('Purchase error:', error);
        alert(error.message || 'Failed to process purchase. Please try again.');
    }
}

// Admin logout
document.getElementById('adminLogoutBtn').addEventListener('click', logout);

// Logout function
function logout() {
    currentUser = null;
    currentUserRole = null;
    currentAdminData = null;
    window.currentSearchedUser = null;
    window.currentPurchaseUser = null;

    userIdInput.value = '';
    signupUserIdInput.value = '';

    userDashboard.classList.add('hidden');
    adminDashboard.classList.add('hidden');
    signupScreen.classList.add('hidden');
    loginScreen.classList.remove('hidden');

    // Reset admin tabs
    document.getElementById('tabBooth').click();

    // Hide search results
    document.getElementById('searchResults').classList.add('hidden');
    document.getElementById('purchaseResults').classList.add('hidden');
}

// Input validation
userIdInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 8);
});

signupUserIdInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 8);
});

document.getElementById('searchUserId').addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 8);
});

document.getElementById('purchaseSearchUserId').addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 8);
});
