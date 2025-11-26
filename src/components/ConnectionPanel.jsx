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

    const inputClasses = "w-full py-3 px-4 text-base border border-border rounded-lg bg-input text-white transition-colors focus:outline-none focus:border-primary focus:bg-input-focus placeholder:text-placeholder";

    return (
        <div className="max-w-[400px] mx-auto my-12 p-8 bg-panel rounded-2xl border border-border shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <h1 className="text-center mb-8 text-2xl font-semibold">Web VNC Client</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-5">
                    <label htmlFor="host" className="block mb-2 text-sm text-muted">
                        Host
                    </label>
                    <div className="relative" ref={dropdownRef}>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                id="host"
                                value={host}
                                onChange={(e) => setHost(e.target.value)}
                                placeholder="pl. 192.168.1.79:5900"
                                required
                                className={inputClasses}
                            />
                            {history.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                                    className="px-3 bg-input border border-border rounded-lg text-white hover:bg-input-focus transition-colors"
                                    title="Előzmények"
                                >
                                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </button>
                            )}
                        </div>
                        {isHistoryOpen && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-panel border border-border rounded-lg shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-50 max-h-60 overflow-y-auto">
                                {history.map((session) => (
                                    <div
                                        key={session.host}
                                        onClick={() => handleSelectHistory(session)}
                                        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-input-focus transition-colors border-b border-border last:border-b-0"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="text-white text-sm truncate">{session.host}</div>
                                            {session.username && (
                                                <div className="text-placeholder text-xs truncate">{session.username}</div>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => handleDeleteClick(e, session.host)}
                                            className="ml-3 p-1.5 text-placeholder hover:text-error hover:bg-error-bg rounded transition-colors"
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
                <div className="mb-5">
                    <label htmlFor="username" className="block mb-2 text-sm text-muted">
                        Felhasználónév
                    </label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Felhasználónév (opcionális)"
                        className={inputClasses}
                    />
                </div>
                <div className="mb-5">
                    <label htmlFor="password" className="block mb-2 text-sm text-muted">
                        Jelszó
                    </label>
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
                        className={`${inputClasses} [font-family:dotsfont] text-xs`}
                    />
                </div>
                <button
                    type="submit"
                    className="w-full py-3.5 text-base font-semibold text-white bg-gradient-to-br from-primary to-primary-dark rounded-lg cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(74,158,255,0.4)] active:translate-y-0"
                >
                    Csatlakozás
                </button>
            </form>
            {status && (
                <div
                    className={`mt-5 p-3 rounded-lg text-center text-sm border ${
                        status.type === 'error'
                            ? 'bg-error-bg border-error-border text-error'
                            : status.type === 'success'
                            ? 'bg-success-bg border-success-border text-success'
                            : 'bg-info-bg border-info-border text-primary'
                    }`}
                >
                    {status.message}
                </div>
            )}
        </div>
    );
}
