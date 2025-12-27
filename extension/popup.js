const FIREBASE_CONFIG = {
    projectId: "blink-linknet",
    apiKey: "AIzaSyDLbiffMbrAG94ZhKuenT6zHizIJNTiiWg"
};

const mainView = document.getElementById('main-view');
const loginView = document.getElementById('login-view');
const disconnectBtn = document.getElementById('disconnect-btn');
const vaultSelect = document.getElementById('vault-select');
const saveBtn = document.getElementById('save-btn');
const loginBtn = document.getElementById('login-btn');
const statusMsg = document.getElementById('status');

let currentTab = null;
let userData = null; // { idToken, localId, email }

// Initialization
async function init() {
    // Get active tab
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    currentTab = tabs[0];
    if (currentTab) {
        document.getElementById('page-title').textContent = currentTab.title;
        document.getElementById('page-url').textContent = currentTab.url;
    }

    // Check Auth State
    const storage = await chrome.storage.local.get(['userData']);
    if (storage.userData && storage.userData.idToken) {
        userData = storage.userData;
        showMainView();
    } else {
        showLoginView();
    }
}

function showMainView() {
    mainView.style.display = 'block';
    loginView.style.display = 'none';
    disconnectBtn.style.display = 'block';
    loadVaults();
}

function showLoginView() {
    mainView.style.display = 'none';
    loginView.style.display = 'block';
    disconnectBtn.style.display = 'none';
}

// LOGIN LOGIC
loginBtn.addEventListener('click', async () => {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!email || !password) {
        showStatus('Please fill in all fields', 'error');
        return;
    }

    setLoading('login', true);
    try {
        const authUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_CONFIG.apiKey}`;
        const response = await fetch(authUrl, {
            method: 'POST',
            body: JSON.stringify({ email, password, returnSecureToken: true })
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        userData = {
            idToken: data.idToken,
            localId: data.localId,
            email: data.email
        };

        await chrome.storage.local.set({ userData });
        showStatus('Signed in successfully!', 'success');
        setTimeout(() => {
            hideStatus();
            showMainView();
        }, 1000);

    } catch (err) {
        console.error('Login error:', err);
        showStatus(formatError(err.message), 'error');
    } finally {
        setLoading('login', false);
    }
});

// DISCONNECT
disconnectBtn.addEventListener('click', async () => {
    await chrome.storage.local.remove(['userData']);
    userData = null;
    showLoginView();
    showStatus('Logged out', 'success');
    setTimeout(hideStatus, 2000);
});

// LOAD VAULTS (Authenticated)
async function loadVaults() {
    try {
        const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents:runQuery?key=${FIREBASE_CONFIG.apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${userData.idToken}`
            },
            body: JSON.stringify({
                structuredQuery: {
                    from: [{ collectionId: 'vaults' }],
                    where: {
                        fieldFilter: {
                            field: { fieldPath: 'ownerId' },
                            op: 'EQUAL',
                            value: { stringValue: userData.localId }
                        }
                    }
                }
            })
        });

        const data = await response.json();

        // Handle token expiration
        if (data.error && data.error.status === 'UNAUTHENTICATED') {
            await chrome.storage.local.remove(['userData']);
            showLoginView();
            showStatus('Session expired. Please sign in again.', 'error');
            return;
        }

        vaultSelect.innerHTML = '';

        // Firestore REST runQuery returns an array of { document: ... } or empty if no results
        const documents = data.filter(item => item.document);

        if (documents.length === 0) {
            const opt = document.createElement('option');
            opt.textContent = 'No containers found';
            vaultSelect.appendChild(opt);
            saveBtn.disabled = true;
            return;
        }

        saveBtn.disabled = false;
        documents.forEach(item => {
            const doc = item.document;
            const id = doc.name.split('/').pop();
            const name = doc.fields.name.stringValue;
            const opt = document.createElement('option');
            opt.value = id;
            opt.textContent = name;
            vaultSelect.appendChild(opt);
        });
    } catch (err) {
        console.error('Error loading vaults:', err);
        vaultSelect.innerHTML = '<option>Error loading containers</option>';
    }
}

// SAVE LINK (Authenticated)
saveBtn.addEventListener('click', async () => {
    const vaultId = vaultSelect.value;
    if (!vaultId) return;

    setLoading('save', true);
    try {
        // 1. Get current vault
        const docUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/vaults/${vaultId}?key=${FIREBASE_CONFIG.apiKey}`;
        const getResp = await fetch(docUrl, {
            headers: { 'Authorization': `Bearer ${userData.idToken}` }
        });
        const vaultDoc = await getResp.json();

        const existingLinks = vaultDoc.fields.links ? vaultDoc.fields.links.arrayValue.values || [] : [];

        // 2. Prepare new link
        const newLink = {
            mapValue: {
                fields: {
                    id: { stringValue: `link_${Date.now()}` },
                    title: { stringValue: currentTab.title },
                    url: { stringValue: currentTab.url },
                    description: { stringValue: '' },
                    createdAt: { timestampValue: new Date().toISOString() },
                    updatedAt: { timestampValue: new Date().toISOString() },
                    createdBy: { stringValue: userData.localId }
                }
            }
        };

        const updatedLinks = [...existingLinks, newLink];

        // 3. Patch Vault
        const patchUrl = `${docUrl}&updateMask.fieldPaths=links`;
        const patchResp = await fetch(patchUrl, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${userData.idToken}` },
            body: JSON.stringify({
                fields: {
                    links: { arrayValue: { values: updatedLinks } }
                }
            })
        });

        if (!patchResp.ok) throw new Error('Failed to update vault');

        showStatus('Saved to Blink!', 'success');
        setTimeout(() => window.close(), 1500);
    } catch (err) {
        console.error('Save error:', err);
        showStatus('Error saving link.', 'error');
    } finally {
        setLoading('save', false);
    }
});

// UTILS
function setLoading(type, isLoading) {
    const btn = type === 'login' ? loginBtn : saveBtn;
    const spinner = document.getElementById(`spinner-${type}`);
    const text = document.getElementById(`${type}-text`);

    btn.disabled = isLoading;
    spinner.style.display = isLoading ? 'block' : 'none';
    text.style.display = isLoading ? 'none' : 'block';
}

function showStatus(msg, type) {
    statusMsg.textContent = msg;
    statusMsg.className = `status-msg status-${type}`;
    statusMsg.style.display = 'block';
}

function hideStatus() {
    statusMsg.style.display = 'none';
}

function formatError(msg) {
    if (msg.includes('INVALID_PASSWORD') || msg.includes('EMAIL_NOT_FOUND')) {
        return 'Invalid email or password';
    }
    return msg;
}

init();
