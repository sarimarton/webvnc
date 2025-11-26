import { useState } from 'react';

export default function ConnectionPanel({ initialSettings, onConnect, status }) {
    const [host, setHost] = useState(initialSettings.host || '');
    const [username, setUsername] = useState(initialSettings.username || '');
    const [password, setPassword] = useState(initialSettings.password || '');

    const handleSubmit = (e) => {
        e.preventDefault();
        onConnect({ host, username, password });
    };

    return (
        <div className="max-w-[400px] mx-auto my-12 p-8 bg-panel-bg rounded-2xl border border-border-light shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <h1 className="text-center mb-8 text-2xl font-semibold">Web VNC Client</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-5">
                    <label htmlFor="host" className="block mb-2 text-sm text-text-muted">
                        Host
                    </label>
                    <input
                        type="text"
                        id="host"
                        value={host}
                        onChange={(e) => setHost(e.target.value)}
                        placeholder="pl. 192.168.1.79:5900"
                        required
                        className="w-full py-3 px-4 text-base border border-border-light rounded-lg bg-input-bg text-white transition-colors duration-200 focus:outline-none focus:border-primary focus:bg-input-focus placeholder:text-text-placeholder"
                    />
                </div>
                <div className="mb-5">
                    <label htmlFor="username" className="block mb-2 text-sm text-text-muted">
                        Felhasználónév
                    </label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Felhasználónév (opcionális)"
                        className="w-full py-3 px-4 text-base border border-border-light rounded-lg bg-input-bg text-white transition-colors duration-200 focus:outline-none focus:border-primary focus:bg-input-focus placeholder:text-text-placeholder"
                    />
                </div>
                <div className="mb-5">
                    <label htmlFor="password" className="block mb-2 text-sm text-text-muted">
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
                        className="w-full py-3 px-4 text-base border border-border-light rounded-lg bg-input-bg text-white transition-colors duration-200 focus:outline-none focus:border-primary focus:bg-input-focus placeholder:text-text-placeholder"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full py-3.5 text-base font-semibold text-white bg-gradient-to-br from-primary to-primary-dark border-none rounded-lg cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(74,158,255,0.4)] active:translate-y-0"
                >
                    Csatlakozás
                </button>
            </form>
            {status && (
                <div
                    className={`mt-5 p-3 rounded-lg text-center text-sm ${
                        status.type === 'error'
                            ? 'bg-error-bg border border-error-border text-error'
                            : status.type === 'success'
                            ? 'bg-success-bg border border-success-border text-success'
                            : 'bg-info-bg border border-info-border text-primary'
                    }`}
                >
                    {status.message}
                </div>
            )}
        </div>
    );
}
