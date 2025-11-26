import { useState, useCallback } from 'react';
import ConnectionPanel from './components/ConnectionPanel';
import VncViewer from './components/VncViewer';
import CredentialsModal from './components/CredentialsModal';

const STORAGE_KEY = 'webvnc_settings';

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
    const [connected, setConnected] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [connectionTarget, setConnectionTarget] = useState(null);
    const [status, setStatus] = useState(null);
    const [credentialsCallback, setCredentialsCallback] = useState(null);

    const handleConnect = useCallback((formData) => {
        saveSettings(formData);
        setSettings(formData);

        const { host, port } = parseHost(formData.host);
        setConnectionTarget({
            host,
            port,
            username: formData.username,
            password: formData.password
        });
        setConnecting(true);
        setStatus({ type: 'info', message: 'Csatlakozás...' });
    }, []);

    const handleConnected = useCallback(() => {
        setConnected(true);
        setConnecting(false);
        setStatus(null);
    }, []);

    const handleDisconnect = useCallback(() => {
        setConnected(false);
        setConnecting(false);
        setConnectionTarget(null);
    }, []);

    const handleDisconnected = useCallback((clean) => {
        setConnected(false);
        setConnecting(false);
        setConnectionTarget(null);
        if (clean) {
            setStatus({ type: 'info', message: 'Kapcsolat bontva.' });
        } else {
            setStatus({ type: 'error', message: 'A kapcsolat váratlanul megszakadt.' });
        }
    }, []);

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
                    onConnect={handleConnect}
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
