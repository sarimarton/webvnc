import RFB from './novnc/core/rfb.js';

const STORAGE_KEY = 'webvnc_settings';

const connectForm = document.getElementById('connect-form');
const connectionPanel = document.getElementById('connection-panel');
const vncContainer = document.getElementById('vnc-container');
const vncScreen = document.getElementById('vnc-screen');
const statusEl = document.getElementById('status');
const connectionInfo = document.getElementById('connection-info');

const hostInput = document.getElementById('host');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');

const btnDisconnect = document.getElementById('btn-disconnect');
const btnFullscreen = document.getElementById('btn-fullscreen');
const btnCtrlAltDel = document.getElementById('btn-ctrl-alt-del');

const credentialsModal = document.getElementById('credentials-modal');
const credentialsForm = document.getElementById('credentials-form');
const modalUsername = document.getElementById('modal-username');
const modalPassword = document.getElementById('modal-password');
const modalCancel = document.getElementById('modal-cancel');

let rfb = null;

// Load saved settings
function loadSettings() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const settings = JSON.parse(saved);
            if (settings.host) hostInput.value = settings.host;
            if (settings.username) usernameInput.value = settings.username;
            if (settings.password) passwordInput.value = settings.password;
        }
    } catch (e) {
        console.error('Failed to load settings:', e);
    }
}

// Save settings
function saveSettings() {
    try {
        const settings = {
            host: hostInput.value,
            username: usernameInput.value,
            password: passwordInput.value
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
        console.error('Failed to save settings:', e);
    }
}

function showStatus(message, type = 'info') {
    statusEl.textContent = message;
    statusEl.className = `status ${type}`;
}

function hideStatus() {
    statusEl.className = 'status';
}

function parseHost(hostValue) {
    let host = hostValue.trim();

    // Remove vnc:// prefix if present
    host = host.replace(/^vnc:\/\//, '');

    let port = 5900;

    if (host.includes(':')) {
        const parts = host.split(':');
        host = parts[0];
        port = parseInt(parts[1], 10) || 5900;
    }

    return { host, port };
}

function showCredentialsModal() {
    return new Promise((resolve, reject) => {
        credentialsModal.classList.remove('hidden');
        modalPassword.focus();

        const handleSubmit = (e) => {
            e.preventDefault();
            credentialsModal.classList.add('hidden');
            cleanup();
            resolve({
                username: modalUsername.value,
                password: modalPassword.value
            });
        };

        const handleCancel = () => {
            credentialsModal.classList.add('hidden');
            cleanup();
            reject(new Error('Cancelled'));
        };

        const cleanup = () => {
            credentialsForm.removeEventListener('submit', handleSubmit);
            modalCancel.removeEventListener('click', handleCancel);
            modalUsername.value = '';
            modalPassword.value = '';
        };

        credentialsForm.addEventListener('submit', handleSubmit);
        modalCancel.addEventListener('click', handleCancel);
    });
}

function connect(host, port, username, password) {
    // Connect through our local websockify proxy
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const url = `${wsProtocol}//${window.location.host}/websockify?host=${encodeURIComponent(host)}&port=${port}`;

    showStatus('Csatlakozás...', 'info');

    try {
        const credentials = {};
        if (username) credentials.username = username;
        if (password) credentials.password = password;

        rfb = new RFB(vncScreen, url, {
            credentials: Object.keys(credentials).length > 0 ? credentials : undefined,
        });

        rfb.scaleViewport = true;
        rfb.resizeSession = false;

        rfb.addEventListener('connect', () => {
            connectionPanel.classList.add('hidden');
            vncContainer.classList.remove('hidden');
            connectionInfo.textContent = `${host}:${port}`;
            hideStatus();
        });

        rfb.addEventListener('disconnect', (e) => {
            vncContainer.classList.add('hidden');
            connectionPanel.classList.remove('hidden');
            rfb = null;

            if (e.detail.clean) {
                showStatus('Kapcsolat bontva.', 'info');
            } else {
                showStatus('A kapcsolat váratlanul megszakadt.', 'error');
            }
        });

        rfb.addEventListener('credentialsrequired', async () => {
            try {
                const creds = await showCredentialsModal();
                rfb.sendCredentials({ username: creds.username, password: creds.password });
            } catch (e) {
                rfb.disconnect();
            }
        });

        rfb.addEventListener('securityfailure', (e) => {
            showStatus(`Biztonsági hiba: ${e.detail.reason}`, 'error');
        });

    } catch (err) {
        showStatus(`Hiba: ${err.message}`, 'error');
    }
}

function disconnect() {
    if (rfb) {
        rfb.disconnect();
    }
}

connectForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saveSettings();
    const { host, port } = parseHost(hostInput.value);
    const username = usernameInput.value;
    const password = passwordInput.value;
    connect(host, port, username, password);
});

btnDisconnect.addEventListener('click', disconnect);

btnFullscreen.addEventListener('click', () => {
    if (vncContainer.requestFullscreen) {
        vncContainer.requestFullscreen();
    } else if (vncContainer.webkitRequestFullscreen) {
        vncContainer.webkitRequestFullscreen();
    }
});

btnCtrlAltDel.addEventListener('click', () => {
    if (rfb) {
        rfb.sendCtrlAltDel();
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    if (rfb) {
        rfb.scaleViewport = true;
    }
});

// Load settings on page load
loadSettings();
