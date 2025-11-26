import { useState, useEffect, useRef } from 'react';

export default function CredentialsModal({ onSubmit, onCancel }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const passwordRef = useRef(null);

    useEffect(() => {
        if (passwordRef.current) {
            passwordRef.current.focus();
        }
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ username, password });
    };

    const inputClasses = "w-full py-3 px-4 text-base border border-border rounded-lg bg-input text-white transition-colors focus:outline-none focus:border-primary focus:bg-input-focus placeholder:text-placeholder";

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
            <div className="bg-modal backdrop-blur-[10px] p-8 rounded-2xl border border-border shadow-[0_8px_32px_rgba(0,0,0,0.5)] min-w-[320px] max-w-[400px]">
                <h2 className="text-center mb-5 text-xl font-semibold">Hitelesítés szükséges</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-5">
                        <label htmlFor="modal-username" className="block mb-2 text-sm text-muted">
                            Felhasználónév
                        </label>
                        <input
                            type="text"
                            id="modal-username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Felhasználónév"
                            className={inputClasses}
                        />
                    </div>
                    <div className="mb-5">
                        <label htmlFor="modal-password" className="block mb-2 text-sm text-muted">
                            Jelszó
                        </label>
                        {/*
                            NOTE: Using type="text" instead of type="password" intentionally!
                            Chrome extensions (like Claude for Chrome) cannot take screenshots
                            of pages containing password fields for security reasons.
                        */}
                        <input
                            type="text"
                            id="modal-password"
                            ref={passwordRef}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Jelszó"
                            required
                            autoComplete="off"
                            className={inputClasses}
                        />
                    </div>
                    <div className="flex gap-2.5 mt-5">
                        <button
                            type="button"
                            className="flex-1 py-2 px-4 text-sm text-white bg-toolbar border border-border rounded-md cursor-pointer transition-colors hover:bg-toolbar-hover"
                            onClick={onCancel}
                        >
                            Mégse
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3.5 text-base font-semibold text-white bg-gradient-to-br from-primary to-primary-dark rounded-lg cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(74,158,255,0.4)] active:translate-y-0"
                        >
                            Bejelentkezés
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
