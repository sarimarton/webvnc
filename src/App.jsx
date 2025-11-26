import { useState, useCallback, useRef } from 'react';
import ConnectionPanel from './components/ConnectionPanel';
import VncViewer from './components/VncViewer';
import CredentialsModal from './components/CredentialsModal';

const STORAGE_KEY = 'webvnc_settings';
const HISTORY_KEY = 'webvnc_history';
const MAX_HISTORY = 10;

function loadSettings() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.error('Failed to load settings:', e);
    }
    return { host: '', username: '', password: '' };
}

function saveSettings(settings) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
        console.error('Failed to save settings:', e);
    }
}

function loadHistory() {
    try {
        const saved = localStorage.getItem(HISTORY_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.error('Failed to load history:', e);
    }
    return [];
}

function saveHistory(history) {
    try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
        console.error('Failed to save history:', e);
    }
}

function addToHistory(history, session) {
    const filtered = history.filter(h => h.host !== session.host);
    const newHistory = [session, ...filtered].slice(0, MAX_HISTORY);
    return newHistory;
}

function parseHost(hostValue) {
    let host = hostValue.trim();
    host = host.replace(/^vnc:\/\//, '');
    let port = 5900;

    if (host.includes(':')) {
        const parts = host.split(':');
        host = parts[0];
        port = parseInt(parts[1], 10) || 5900;
    }

    return { host, port };
}

export default function App() {
    const [settings, setSettings] = useState(loadSettings);
    const [history, setHistory] = useState(loadHistory);
    const [connected, setConnected] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [connectionTarget, setConnectionTarget] = useState(null);
    const [status, setStatus] = useState(null);
    const [credentialsCallback, setCredentialsCallback] = useState(null);

    // Use refs for values needed in stable callbacks
    const pendingSessionRef = useRef(null);
    const historyRef = useRef(history);
    historyRef.current = history;

    const handleConnect = useCallback((formData) => {
        saveSettings(formData);
        setSettings(formData);

        const { host, port } = parseHost(formData.host);
        const target = {
            host,
            port,
            username: formData.username,
            password: formData.password
        };
        setConnectionTarget(target);
        pendingSessionRef.current = formData;
        setConnecting(true);
        setStatus({ type: 'info', message: 'Csatlakozás...' });
    }, []);

    const handleConnected = useCallback(() => {
        setConnected(true);
        setConnecting(false);
        setStatus(null);

        if (pendingSessionRef.current) {
            const newHistory = addToHistory(historyRef.current, pendingSessionRef.current);
            setHistory(newHistory);
            saveHistory(newHistory);
            pendingSessionRef.current = null;
        }
    }, []);

    const handleDisconnect = useCallback(() => {
        setConnected(false);
        setConnecting(false);
        setConnectionTarget(null);
        pendingSessionRef.current = null;
    }, []);

    const handleDisconnected = useCallback((clean) => {
        setConnected(false);
        setConnecting(false);
        setConnectionTarget(null);
        pendingSessionRef.current = null;
        if (clean) {
            setStatus({ type: 'info', message: 'Kapcsolat bontva.' });
        } else {
            setStatus({ type: 'error', message: 'A kapcsolat váratlanul megszakadt.' });
        }
    }, []);

    const handleDeleteHistory = useCallback((hostToDelete) => {
        const newHistory = history.filter(h => h.host !== hostToDelete);
        setHistory(newHistory);
        saveHistory(newHistory);
    }, [history]);

    const handleCredentialsRequired = useCallback(() => {
        return new Promise((resolve, reject) => {
            setCredentialsCallback({ resolve, reject });
        });
    }, []);

    const handleCredentialsSubmit = useCallback((creds) => {
        if (credentialsCallback) {
            credentialsCallback.resolve(creds);
            setCredentialsCallback(null);
        }
    }, [credentialsCallback]);

    const handleCredentialsCancel = useCallback(() => {
        if (credentialsCallback) {
            credentialsCallback.reject(new Error('Cancelled'));
            setCredentialsCallback(null);
        }
    }, [credentialsCallback]);

    const handleSecurityFailure = useCallback((reason) => {
        setStatus({ type: 'error', message: `Biztonsági hiba: ${reason}` });
    }, []);

    return (
        <>
            {!connected && !connecting && (
                <ConnectionPanel
                    initialSettings={settings}
                    history={history}
                    onConnect={handleConnect}
                    onDeleteHistory={handleDeleteHistory}
                    status={status}
                />
            )}

            {(connected || connecting) && connectionTarget && (
                <VncViewer
                    host={connectionTarget.host}
                    port={connectionTarget.port}
                    username={connectionTarget.username}
                    password={connectionTarget.password}
                    onConnected={handleConnected}
                    onDisconnected={handleDisconnected}
                    onDisconnect={handleDisconnect}
                    onCredentialsRequired={handleCredentialsRequired}
                    onSecurityFailure={handleSecurityFailure}
                />
            )}

            {credentialsCallback && (
                <CredentialsModal
                    onSubmit={handleCredentialsSubmit}
                    onCancel={handleCredentialsCancel}
                />
            )}
        </>
    );
}
