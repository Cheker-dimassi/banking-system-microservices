// Banking Dashboard JavaScript - Connects to your backend APIs

const API_BASE = 'http://localhost:3000/api';

// State Management
const state = {
    accounts: [],
    transactions: [],
    categories: [],
    currentUser: null
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 BankHub Dashboard Loading...');
});

// Authentication
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Demo login (in real app, validate with backend)
    state.currentUser = {
        name: 'Demo User',
        email: username
    };

    // Show dashboard
    document.getElementById('loginScreen').classList.remove('active');
    document.getElementById('dashboardScreen').classList.add('active');

    // Load data
    loadDashboardData();
}

function logout() {
    state.currentUser = null;
    document.getElementById('dashboardScreen').classList.remove('active');
    document.getElementById('loginScreen').classList.add('active');
}

// Tab Navigation
function showTab(tabName) {
    // Remove active class from all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(tabName + 'Tab').classList.add('active');

    // Add active class to clicked nav item
    event.target.closest('.nav-item').classList.add('active');

    // Load specific tab data
    switch (tabName) {
        case 'accounts':
            loadAccounts();
            break;
        case 'transactions':
            loadAllTransactions();
            break;
        case 'categories':
            loadCategories();
            break;
    }
}

// Load Dashboard Data
async function loadDashboardData() {
    try {
        await Promise.all([
            loadAccounts(),
            loadTransactions(),
            loadCategories()
        ]);

        updateStats();
        displayRecentTransactions();
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showError('Failed to load dashboard data');
    }
}

// Fetch Accounts
async function loadAccounts() {
    try {
        const response = await fetch(`${API_BASE}/comptes`);
        const data = await response.json();

        if (data.success) {
            state.accounts = data.data;
            displayAccounts();
            updateStats();
        }
    } catch (error) {
        console.error('Error loading accounts:', error);
        state.accounts = [];
        displayAccounts();
    }
}

// Fetch Transactions
async function loadTransactions() {
    try {
        const response = await fetch(`${API_BASE}/transactions`);
        const data = await response.json();

        if (data.success) {
            state.transactions = data.transactions || [];
        }
    } catch (error) {
        console.error('Error loading transactions:', error);
        state.transactions = [];
    }
}

// Fetch Categories
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE}/categories`);
        const data = await response.json();

        if (data.success) {
            // Fix: Backend returns 'categories', not 'data'
            state.categories = data.categories || data.data || [];
            displayCategories();
        }
    } catch (error) {
        console.error('Error loading categories:', error);
        state.categories = [];
        displayCategories();
    }
}

// Update Stats
function updateStats() {
    // Total Balance
    const totalBalance = state.accounts.reduce((sum, acc) => sum + (acc.solde || 0), 0);
    document.getElementById('totalBalance').textContent = formatCurrency(totalBalance);

    // Total Accounts
    document.getElementById('totalAccounts').textContent = state.accounts.length;

    // Total Transactions
    document.getElementById('totalTransactions').textContent = state.transactions.length;

    // Total Categories
    document.getElementById('totalCategories').textContent = state.categories.length;
}

// Display Accounts
function displayAccounts() {
    const container = document.getElementById('accountsGrid');

    if (state.accounts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color: var(--text-muted)">
                    <rect x="1" y="4" width="22" height="16" rx="2" stroke-width="2"/>
                    <path d="M1 10h22" stroke-width="2"/>
                </svg>
                <h3>No accounts yet</h3>
                <p>Create your first account to get started</p>
            </div>
        `;
        return;
    }

    container.innerHTML = state.accounts.map(account => `
        <div class="account-card" style="animation: fadeInUp 0.4s ease-out;">
            <div class="account-header">
                <div>
                    <p class="account-type">${account.typeCompte || 'Checking'}</p>
                    <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
                         <button class="btn btn-small btn-primary" onclick="viewAccountHistory('${account.numeroCompte || account._id}')">History</button>
                         <button class="btn btn-small btn-outline" onclick="editAccount('${account._id}')">Edit</button>
                         <button class="btn btn-small btn-outline" style="color: #ef4444; border-color: #ef4444;" onclick="closeAccount('${account._id}')">Close</button>
                    </div>
                </div>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="1" y="4" width="22" height="16" rx="2" stroke-width="2"/>
                    <path d="M1 10h22" stroke-width="2"/>
                </svg>
            </div>
            <div class="account-balance">${formatCurrency(account.solde || 0)}</div>
            <div class="account-number">${formatAccountNumber(account.numeroCompte || 'N/A')}</div>
        </div>
    `).join('');
}

// View Account History
async function viewAccountHistory(accountId) {
    showTab('transactions');
    const container = document.getElementById('allTransactionsList');
    container.innerHTML = '<div class="loading-spinner"></div>';

    try {
        // Use the specific endpoint for account transactions
        // Note: We might need to handle if accountId is _id or numeroCompte based on backend expectation.
        // The backend route is /transactions/account/:accountId. 
        // Assuming it accepts the MongoDB _id or the Account Number depending on implementation.
        // Let's try the ID first.
        const response = await fetch(`${API_BASE}/transactions/account/${accountId}`);
        const data = await response.json();

        if (data.success) {
            state.transactions = data.transactions || data.data || [];

            // Render with a "Clear Filter" header
            if (state.transactions.length === 0) {
                container.innerHTML = `
                    <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
                        <h3 style="margin: 0;">Account History</h3>
                        <button class="btn btn-outline" onclick="loadAllTransactions()">Show All Transactions</button>
                    </div>
                    <div class="empty-state">
                        <h3>No transactions found for this account</h3>
                    </div>
                `;
            } else {
                container.innerHTML = `
                    <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
                        <h3 style="margin: 0;">Account History (${state.transactions.length})</h3>
                        <button class="btn btn-outline" onclick="loadAllTransactions()">Show All Transactions</button>
                    </div>
                    ${state.transactions.map(tx => createTransactionHTML(tx)).join('')}
                `;
            }
        } else {
            showError('Failed to load account history');
            loadAllTransactions();
        }
    } catch (error) {
        console.error('Error fetching account history:', error);
        showError('Error loading history');
        loadAllTransactions();
    }
}

// Display Recent Transactions
function displayRecentTransactions() {
    const container = document.getElementById('recentTransactionsList');
    const recent = state.transactions.slice(0, 5);

    if (recent.length === 0) {
        container.innerHTML = `
            <div class="empty-state-small">
                <p style="color: var(--text-muted); text-align: center;">No transactions yet</p>
            </div>
        `;
        return;
    }

    container.innerHTML = recent.map(tx => createTransactionHTML(tx)).join('');
}

// Display All Transactions
async function loadAllTransactions() {
    const container = document.getElementById('allTransactionsList');
    container.innerHTML = '<div class="loading-spinner"></div>';

    await loadTransactions();

    if (state.transactions.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color: var(--text-muted)">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" stroke-width="2"/>
                    <rect x="8" y="2" width="8" height="4" rx="1" stroke-width="2"/>
                </svg>
                <h3>No transactions yet</h3>
                <p>Your transaction history will appear here</p>
            </div>
        `;
        return;
    }

    // Default header for All Transactions
    container.innerHTML = `
        <h3 style="margin-bottom: 20px;">All Transactions</h3>
        ${state.transactions.map(tx => createTransactionHTML(tx)).join('')}
    `;
}

// Create Transaction HTML
function createTransactionHTML(tx) {
    const type = tx.type || 'transfer';
    const isDeposit = type === 'deposit';
    const isWithdrawal = type === 'withdrawal';

    const iconClass = isDeposit ? 'deposit' : isWithdrawal ? 'withdrawal' : 'transfer';
    const icon = isDeposit ?
        '<path d="M12 5v14M5 12l7-7 7 7" stroke-width="2"/>' :
        isWithdrawal ?
            '<path d="M12 19V5M5 12l7 7 7-7" stroke-width="2"/>' :
            '<path d="M5 12h14M12 5l7 7-7 7" stroke-width="2"/>';

    const amount = tx.amount || 0;
    const amountClass = isDeposit ? 'positive' : 'negative';
    const amountPrefix = isDeposit ? '+' : '-';

    return `
        <div class="transaction-item">
            <div class="transaction-icon ${iconClass}">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    ${icon}
                </svg>
            </div>
            <div class="transaction-details">
                <div class="transaction-title">${capitalizeFirst(type)}</div>
                <div class="transaction-meta">
                    ${tx.description || tx.transactionId || 'Transaction'}
                    • ${formatDate(tx.timestamp || tx.createdAt)}
                </div>
            </div>
            <div class="transaction-amount ${amountClass}">
                ${amountPrefix}${formatCurrency(amount)}
            </div>
             <div class="transaction-actions" style="margin-left: 1rem; display: flex; gap: 5px;">
                <button class="btn btn-small btn-outline" title="Edit Description" onclick="editTransaction('${tx.transactionId || tx._id}')">✏️</button>
                <button class="btn btn-small btn-outline" title="Reverse/Refund" onclick="reverseTransaction('${tx.transactionId || tx._id}')">↩️</button>
            </div>
        </div>
    `;
}

// Display Categories
function displayCategories() {
    const container = document.getElementById('categoriesGrid');

    if (state.categories.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color: var(--text-muted)">
                    <circle cx="12" cy="12" r="10" stroke-width="2"/>
                    <path d="M12 6v6l4 2" stroke-width="2"/>
                </svg>
                <h3>No categories yet</h3>
                <p>Create categories to organize your expenses</p>
            </div>
        `;
        return;
    }

    container.innerHTML = state.categories.map(cat => `
        <div class="category-card" onclick="selectCategory('${cat.categoryId}')">
            <div class="category-icon-wrapper" style="background: ${cat.color || '#6366f1'}20; color: ${cat.color || '#6366f1'}">
                <span>${cat.icon || '📁'}</span>
            </div>
            <div class="category-name">${cat.name || 'Unnamed'}</div>
            <div class="category-type">${cat.type || 'expense'}</div>
        </div>
    `).join('');
}

// Modals
function showNewAccountModal() {
    const modal = `
        <div class="modal-overlay" onclick="closeModal()">
            <div class="modal glass-effect" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3>Create New Account</h3>
                    <button class="close-btn" onclick="closeModal()">×</button>
                </div>
                <div class="modal-body">
                    <div class="input-group">
                        <label>Account Type</label>
                        <select id="newAccountType">
                            <option value="COURANT">Checking (COURANT)</option>
                            <option value="EPARGNE">Savings (EPARGNE)</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label>Initial Balance</label>
                        <input type="number" id="newAccountBalance" placeholder="0.00" value="1000">
                    </div>
                    <div class="input-group">
                        <label>Email</label>
                        <input type="email" id="newAccountEmail" placeholder="user@example.com" value="demo@bankhub.com">
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
                    <button class="btn btn-primary" onclick="createAccount()">Create Account</button>
                </div>
            </div>
        </div>
    `;
    document.getElementById('modalContainer').innerHTML = modal;
}

function showNewTransactionModal() {
    const modal = `
        <div class="modal-overlay" onclick="closeModal()">
            <div class="modal glass-effect" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3>New Transaction</h3>
                    <button class="close-btn" onclick="closeModal()">×</button>
                </div>
                <div class="modal-body">
                    <div class="input-group">
                        <label>Type</label>
                        <select id="newTxType">
                            <option value="deposit">Deposit</option>
                            <option value="withdrawal">Withdrawal</option>
                            <option value="transfer">Transfer</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label>Amount (TND)</label>
                        <input type="number" id="newTxAmount" placeholder="0.00" value="100">
                    </div>
                    <div class="input-group">
                        <label>Description</label>
                        <input type="text" id="newTxDescription" placeholder="Transaction description" value="Test transaction">
                    </div>
                    <div class="input-group">
                        <label>Account Number</label>
                        <input type="text" id="newTxAccount" placeholder="Account number" value="${state.accounts[0]?.numeroCompte || ''}">
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
                    <button class="btn btn-primary" onclick="createTransaction()">Create Transaction</button>
                </div>
            </div>
        </div>
    `;
    document.getElementById('modalContainer').innerHTML = modal;
}

function showNewCategoryModal() {
    const modal = `
        <div class="modal-overlay" onclick="closeModal()">
            <div class="modal glass-effect" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3>Create Category</h3>
                    <button class="close-btn" onclick="closeModal()">×</button>
                </div>
                <div class="modal-body">
                    <div class="input-group">
                        <label>Name</label>
                        <input type="text" id="newCatName" placeholder="Category name" value="Food & Dining">
                    </div>
                    <div class="input-group">
                        <label>Type</label>
                        <select id="newCatType">
                            <option value="expense">Expense</option>
                            <option value="income">Income</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label>Color</label>
                        <input type="color" id="newCatColor" value="#6366f1">
                    </div>
                    <div class="input-group">
                        <label>Icon (emoji)</label>
                        <input type="text" id="newCatIcon" placeholder="🍔" value="🍔" maxlength="2">
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
                    <button class="btn btn-primary" onclick="createCategory()">Create Category</button>
                </div>
            </div>
        </div>
    `;
    document.getElementById('modalContainer').innerHTML = modal;
}

function closeModal() {
    document.getElementById('modalContainer').innerHTML = '';
}

// Create Account
async function createAccount() {
    const type = document.getElementById('newAccountType').value;
    const balance = parseFloat(document.getElementById('newAccountBalance').value);
    const email = document.getElementById('newAccountEmail').value;

    console.log('Creating account with:', { type, balance, email });

    try {
        const payload = {
            typeCompte: type,
            solde: balance,
            devise: 'TND',
            email: email,
            clientId: '550e8400-e29b-41d4-a716-446655440000'
        };

        console.log('Sending payload:', payload);

        const response = await fetch(`${API_BASE}/comptes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);

        if (data.success) {
            showSuccess('Account created successfully!');
            closeModal();
            loadAccounts();
        } else {
            // Show detailed error
            const errorMsg = data.message || data.error || JSON.stringify(data, null, 2);
            console.error('Account creation failed:', errorMsg);
            showError(errorMsg);
        }
    } catch (error) {
        console.error('Error creating account:', error);
        showError('Error creating account: ' + error.message);
    }
}

// Create Transaction
async function createTransaction() {
    const type = document.getElementById('newTxType').value;
    const amount = parseFloat(document.getElementById('newTxAmount').value);
    const description = document.getElementById('newTxDescription').value;
    const account = document.getElementById('newTxAccount').value;

    try {
        const response = await fetch(`${API_BASE}/transactions/${type}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: type,
                toAccount: type === 'deposit' ? account : undefined,
                fromAccount: type === 'withdrawal' ? account : undefined,
                amount: amount,
                currency: 'TND',
                description: description
            })
        });

        const data = await response.json();

        if (data.success) {
            showSuccess('Transaction completed!');
            closeModal();
            loadDashboardData();
        } else {
            showError(data.message || 'Transaction failed');
        }
    } catch (error) {
        showError('Error processing transaction');
        console.error(error);
    }
}

// Create Category
async function createCategory() {
    const name = document.getElementById('newCatName').value;
    const type = document.getElementById('newCatType').value;
    const color = document.getElementById('newCatColor').value;
    const icon = document.getElementById('newCatIcon').value;

    try {
        const response = await fetch(`${API_BASE}/categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: name,
                type: type,
                color: color,
                icon: icon
            })
        });

        const data = await response.json();

        if (data.success) {
            showSuccess('Category created!');
            closeModal();
            loadCategories();
        } else {
            // DEBUG: Show exact response from server
            const errorMsg = data.error || data.message || JSON.stringify(data);
            console.error('Category creation failed:', errorMsg);
            showError(errorMsg);
        }
    } catch (error) {
        showError('Error creating category');
        console.error(error);
    }
}

// Utility Functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'TND',
        minimumFractionDigits: 2
    }).format(amount);
}

function formatAccountNumber(number) {
    if (!number) return 'N/A';
    return number.replace(/(.{4})/g, '$1 ').trim();
}

function formatDate(date) {
    if (!date) return 'Just now';
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function showSuccess(message) {
    // TODO: Implement toast notification
    alert(message);
}

function showError(message) {
    // TODO: Implement toast notification
    alert('Error: ' + message);
}

function viewAccountDetails(id) {
    showTab('transactions');
    // TODO: Filter transactions by account
}

function selectCategory(id) {
    const category = state.categories.find(c => c.categoryId === id);
    if (!category) return;

    const modal = `
        <div class="modal-overlay" onclick="closeModal()">
            <div class="modal glass-effect" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3>Edit Category</h3>
                    <button class="close-btn" onclick="closeModal()">×</button>
                </div>
                <div class="modal-body">
                    <div class="input-group">
                        <label>Name</label>
                        <input type="text" id="editCatName" value="${category.name}">
                    </div>
                    <div class="input-group">
                        <label>Type</label>
                         <select id="editCatType" disabled style="opacity: 0.7; cursor: not-allowed;">
                            <option value="expense" ${category.type === 'expense' ? 'selected' : ''}>Expense</option>
                            <option value="income" ${category.type === 'income' ? 'selected' : ''}>Income</option>
                            <option value="transfer" ${category.type === 'transfer' ? 'selected' : ''}>Transfer</option>
                        </select>
                         <small style="color: var(--text-muted); margin-top: 0.2rem;">Type cannot be changed</small>
                    </div>
                    <div class="input-group">
                        <label>Color</label>
                        <input type="color" id="editCatColor" value="${category.color}">
                    </div>
                     <div class="input-group">
                        <label>Icon</label>
                        <input type="text" id="editCatIcon" value="${category.icon}" maxlength="2">
                    </div>
                </div>
                <div class="modal-footer" style="justify-content: space-between;">
                    <button class="btn btn-outline" style="color: #ef4444; border-color: #ef4444;" onclick="deleteCategoryAPI('${id}')">Delete</button>
                    <div style="display: flex; gap: 10px;">
                         <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
                         <button class="btn btn-primary" onclick="updateCategoryAPI('${id}')">Save Changes</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.getElementById('modalContainer').innerHTML = modal;
}

async function deleteCategoryAPI(id) {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
        const response = await fetch(`${API_BASE}/categories/${id}`, {
            method: 'DELETE'
        });
        const data = await response.json();

        if (response.ok && data.success) {
            showSuccess('Category deleted');
            closeModal();
            loadCategories();
        } else {
            showError(data.error || data.message || 'Failed to delete');
        }
    } catch (err) {
        showError('Error deleting: ' + err.message);
    }
}

async function updateCategoryAPI(id) {
    const name = document.getElementById('editCatName').value;
    const color = document.getElementById('editCatColor').value;
    const icon = document.getElementById('editCatIcon').value;

    try {
        const response = await fetch(`${API_BASE}/categories/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, color, icon })
        });
        const data = await response.json();

        if (response.ok && data.success) {
            showSuccess('Category updated');
            closeModal();
            loadCategories();
        } else {
            showError(data.error || data.message || 'Failed to update');
        }
    } catch (err) {
        showError('Error updating: ' + err.message);
    }
}


// ==========================================
// NEW: Account Management (Edit/Close)
// ==========================================

async function closeAccount(id) {
    if (!confirm('Are you sure you want to close this account? This action cannot be undone.')) return;

    try {
        const response = await fetch(`${API_BASE}/comptes/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showSuccess('Account closed successfully');
            loadAccounts();
        } else {
            const data = await response.json();
            showError(data.message || data.error || 'Failed to close account');
        }
    } catch (error) {
        showError('Error closing account: ' + error.message);
    }
}

function editAccount(id) {
    const account = state.accounts.find(a => a._id === id);
    if (!account) return;

    const modal = `
        <div class="modal-overlay" onclick="closeModal()">
            <div class="modal glass-effect" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3>Edit Account</h3>
                    <button class="close-btn" onclick="closeModal()">×</button>
                </div>
                <div class="modal-body">
                    <div class="input-group">
                        <label>Account ID</label>
                        <input type="text" value="${account.numeroCompte}" disabled style="opacity: 0.7;">
                    </div>
                    <div class="input-group">
                        <label>Email</label>
                        <input type="email" id="editAccEmail" value="${account.client?.email || account.email || ''}">
                    </div>
                     <div class="input-group">
                        <label>Status</label>
                        <select id="editAccStatus">
                            <option value="ACTIF">Active</option>
                            <option value="SUSPENDU">Suspended</option>
                            <option value="CLOTURE">Closed</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
                    <button class="btn btn-primary" onclick="updateAccount('${id}')">Save Changes</button>
                </div>
            </div>
        </div>
    `;
    document.getElementById('modalContainer').innerHTML = modal;
}

async function updateAccount(id) {
    const email = document.getElementById('editAccEmail').value;
    const status = document.getElementById('editAccStatus').value; // We might need to send this if backend supports it

    try {
        const response = await fetch(`${API_BASE}/comptes/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, statut: status })
        });

        const data = await response.json();
        if (data.success || response.ok) {
            showSuccess('Account updated');
            closeModal();
            loadAccounts();
        } else {
            showError(data.message || 'Failed to update account');
        }
    } catch (e) {
        showError(e.message);
    }
}

// ==========================================
// NEW: Transaction Management (Review/Edit)
// ==========================================

async function reverseTransaction(id) {
    if (!confirm('Refund this transaction? This will create a new counter-transaction.')) return;

    try {
        const response = await fetch(`${API_BASE}/transactions/${id}/reverse`, {
            method: 'POST'
        });
        const data = await response.json();

        if (response.ok) {
            showSuccess('Transaction refunded/reversed successfully');
            loadDashboardData(); // Refresh all
        } else {
            showError(data.error || 'Failed to reverse transaction');
        }
    } catch (e) {
        showError('Network error: ' + e.message);
    }
}

function editTransaction(id) {
    const tx = state.transactions.find(t => (t.transactionId === id || t._id === id));
    if (!tx) return;

    const modal = `
        <div class="modal-overlay" onclick="closeModal()">
            <div class="modal glass-effect" onclick="event.stopPropagation()">
                 <div class="modal-header">
                    <h3>Edit Transaction Details</h3>
                    <button class="close-btn" onclick="closeModal()">×</button>
                </div>
                <div class="modal-body">
                    <p style="color: var(--text-muted); font-size: 0.9rem;">Only the description can be edited for banking security.</p>
                    <div class="input-group">
                        <label>Description</label>
                        <input type="text" id="editTxDesc" value="${tx.description || ''}">
                    </div>
                </div>
                <div class="modal-footer">
                     <button class="btn btn-outline" style="color: #ef4444; border-color: #ef4444;" onclick="deleteTransaction('${id}')">Delete (Admin)</button>
                     <div style="display: flex; gap: 10px;">
                        <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
                        <button class="btn btn-primary" onclick="updateTransaction('${id}')">Save</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.getElementById('modalContainer').innerHTML = modal;
}

async function updateTransaction(id) {
    const description = document.getElementById('editTxDesc').value;
    try {
        const response = await fetch(`${API_BASE}/transactions/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description })
        });

        if (response.ok) {
            showSuccess('Transaction updated');
            closeModal();
            loadAllTransactions();
        } else {
            showError('Failed to update transaction');
        }
    } catch (e) {
        showError(e.message);
    }
}

async function deleteTransaction(id) {
    if (!confirm('DANGER: Deleting a transaction is not recommended. Verification required. Proceed?')) return;

    try {
        const response = await fetch(`${API_BASE}/transactions/${id}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            showSuccess('Transaction deleted permanently');
            closeModal();
            loadDashboardData();
        } else {
            showError('Failed to delete');
        }
    } catch (e) {
        showError(e.message);
    }
}

// Add modal styles dynamically
const modalStyles = `
<style>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.2s ease-out;
}

.modal {
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    border-radius: var(--radius-xl);
    animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.modal-header {
    padding: var(--spacing-lg);
    border-bottom: 1px solid var(--glass-border);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-header h3 {
    font-size: 1.5rem;
    font-weight: 700;
}

.close-btn {
    width: 32px;
    height: 32px;
    border: none;
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
    border-radius: 50%;
    font-size: 1.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.close-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: rotate(90deg);
}

.modal-body {
    padding: var(--spacing-lg);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
}

.modal-body select {
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid var(--glass-border);
    border-radius: var(--radius-md);
    color: var(--text-primary);
    font-size: 1rem;
}

.modal-body select:focus {
    outline: none;
    border-color: var(--primary);
}

.modal-footer {
    padding: var(--spacing-lg);
    border-top: 1px solid var(--glass-border);
    display: flex;
    gap: var(--spacing-sm);
    justify-content: flex-end;
}

.empty-state {
    text-align: center;
    padding: var(--spacing-xl);
    color: var(--text-muted);
}

.empty-state h3 {
    margin: var(--spacing-md) 0 var(--spacing-xs) 0;
    color: var(--text-primary);
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', modalStyles);
