import { useEffect, useRef, useCallback } from 'react';
import RFB from '../../public/novnc/core/rfb.js';

export default function VncViewer({
    host,
    port,
    username,
    password,
    onConnected,
    onDisconnected,
    onDisconnect,
    onCredentialsRequired,
    onSecurityFailure
}) {
    const screenRef = useRef(null);
    const containerRef = useRef(null);
    const rfbRef = useRef(null);

    const handleFullscreen = useCallback(() => {
        if (containerRef.current) {
            if (containerRef.current.requestFullscreen) {
                containerRef.current.requestFullscreen();
            } else if (containerRef.current.webkitRequestFullscreen) {
                containerRef.current.webkitRequestFullscreen();
            }
        }
    }, []);

    useEffect(() => {
        if (!screenRef.current) return;

        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const url = `${wsProtocol}//${window.location.host}/websockify?host=${encodeURIComponent(host)}&port=${port}`;

        const credentials = {};
        if (username) credentials.username = username;
        if (password) credentials.password = password;

        const rfb = new RFB(screenRef.current, url, {
            credentials: Object.keys(credentials).length > 0 ? credentials : undefined,
        });

        rfb.scaleViewport = true;
        rfb.resizeSession = false;

        rfb.addEventListener('connect', () => {
            onConnected();
            // Force resize after connection to fix black screen issue
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
                rfb.scaleViewport = false;
                rfb.scaleViewport = true;
            }, 100);
        });

        rfb.addEventListener('disconnect', (e) => {
            onDisconnected(e.detail.clean);
        });

        rfb.addEventListener('credentialsrequired', async () => {
            try {
                const creds = await onCredentialsRequired();
                rfb.sendCredentials({ username: creds.username, password: creds.password });
            } catch (e) {
                rfb.disconnect();
            }
        });

        rfb.addEventListener('securityfailure', (e) => {
            onSecurityFailure(e.detail.reason);
        });

        rfbRef.current = rfb;

        const handleResize = () => {
            if (rfbRef.current) {
                rfbRef.current.scaleViewport = true;
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (rfbRef.current) {
                rfbRef.current.disconnect();
                rfbRef.current = null;
            }
        };
    }, [host, port, username, password, onConnected, onDisconnected, onCredentialsRequired, onSecurityFailure]);

    const handleDisconnectClick = useCallback(() => {
        if (rfbRef.current) {
            rfbRef.current.disconnect();
        }
        onDisconnect();
    }, [onDisconnect]);

    return (
        <div className="vnc-container" ref={containerRef}>
            <div className="vnc-toolbar">
                <button
                    className="btn-toolbar btn-disconnect"
                    onClick={handleDisconnectClick}
                >
                    Bontás
                </button>
                <button
                    className="btn-toolbar"
                    onClick={handleFullscreen}
                >
                    Teljes képernyő
                </button>
                <span className="connection-info">{host}:{port}</span>
            </div>
            <div className="vnc-screen" ref={screenRef}></div>
        </div>
    );
}
