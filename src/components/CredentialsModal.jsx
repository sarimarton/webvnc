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

    return (
        <div className="modal">
            <div className="modal-content">
                <h2>Hitelesítés szükséges</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="modal-username">Felhasználónév</label>
                        <input
                            type="text"
                            id="modal-username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Felhasználónév"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="modal-password">Jelszó</label>
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
                        />
                    </div>
                    <div className="modal-buttons">
                        <button
                            type="button"
                            className="btn-toolbar"
                            onClick={onCancel}
                        >
                            Mégse
                        </button>
                        <button type="submit" className="btn-connect">
                            Bejelentkezés
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
