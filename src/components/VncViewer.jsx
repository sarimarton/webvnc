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
        <div className="flex-1 flex flex-col bg-black" ref={containerRef}>
            <div className="flex items-center gap-2.5 py-2.5 px-4 bg-dark-bg border-b border-border-light">
                <button
                    className="py-2 px-4 text-sm text-white bg-disconnect border border-disconnect-border rounded-md cursor-pointer transition-colors duration-200 hover:bg-disconnect-hover"
                    onClick={handleDisconnectClick}
                >
                    Bontás
                </button>
                <button
                    className="py-2 px-4 text-sm text-white bg-btn-toolbar border border-border-light rounded-md cursor-pointer transition-colors duration-200 hover:bg-btn-toolbar-hover"
                    onClick={handleFullscreen}
                >
                    Teljes képernyő
                </button>
                <span className="ml-auto text-sm text-text-muted">{host}:{port}</span>
            </div>
            <div className="flex-1 flex items-center justify-center overflow-auto [&_canvas]:max-w-full [&_canvas]:max-h-full" ref={screenRef}></div>
        </div>
    );
}
