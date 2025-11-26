import { useState, useRef, useEffect } from 'react';

export default function ConnectionPanel({ initialSettings, history, onConnect, onDeleteHistory, status }) {
    const [host, setHost] = useState(initialSettings.host || '');
    const [username, setUsername] = useState(initialSettings.username || '');
    const [password, setPassword] = useState(initialSettings.password || '');
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsHistoryOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        onConnect({ host, username, password });
    };

    const handleSelectHistory = (session) => {
        setHost(session.host);
        setUsername(session.username || '');
        setPassword(session.password || '');
        setIsHistoryOpen(false);
    };

    const handleDeleteClick = (e, hostToDelete) => {
        e.stopPropagation();
        onDeleteHistory(hostToDelete);
    };

    return (
        <div className="panel">
            <h1>Web VNC Client</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="host">Host</label>
                    <div style={{ position: 'relative' }} ref={dropdownRef}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                                type="text"
                                id="host"
                                value={host}
                                onChange={(e) => setHost(e.target.value)}
                                placeholder="pl. 192.168.1.79:5900"
                                required
                            />
                            {history.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                                    className="history-button"
                                    title="Előzmények"
                                >
                                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </button>
                            )}
                        </div>
                        {isHistoryOpen && (
                            <div className="history-dropdown">
                                {history.map((session) => (
                                    <div
                                        key={session.host}
                                        className="history-item"
                                        onClick={() => handleSelectHistory(session)}
                                    >
                                        <div className="history-item-info">
                                            <div className="history-item-host">{session.host}</div>
                                            {session.username && (
                                                <div className="history-item-user">{session.username}</div>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => handleDeleteClick(e, session.host)}
                                            className="history-delete"
                                            title="Törlés"
                                        >
                                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="username">Felhasználónév</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Felhasználónév (opcionális)"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Jelszó</label>
                    {/*
                        NOTE: Using type="text" instead of type="password" intentionally!
                        Chrome extensions (like Claude for Chrome) cannot take screenshots
                        of pages containing password fields for security reasons.
                        This allows the extension to capture the VNC screen.
                    */}
                    <input
                        type="text"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Jelszó (opcionális)"
                        autoComplete="off"
                    />
                </div>
                <button type="submit" className="btn-connect">
                    Csatlakozás
                </button>
            </form>
            {status && (
                <div className={`status ${status.type}`}>
                    {status.message}
                </div>
            )}
        </div>
    );
}
