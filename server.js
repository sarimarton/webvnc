import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import net from 'net';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV !== 'production';

async function startServer() {
    if (isDev) {
        // Development: use Vite middleware
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: 'spa'
        });
        app.use(vite.middlewares);
    } else {
        // Production: serve built files
        app.use(express.static(join(__dirname, 'dist')));
    }

    const server = createServer(app);

    // WebSocket server for proxying to VNC
    const wss = new WebSocketServer({ server, path: '/websockify' });

    wss.on('connection', (ws, req) => {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const targetHost = url.searchParams.get('host');
        const targetPort = parseInt(url.searchParams.get('port'), 10) || 5900;

        if (!targetHost) {
            ws.close(1008, 'Missing host parameter');
            return;
        }

        console.log(`WebSocket connection: proxying to ${targetHost}:${targetPort}`);

        const tcpSocket = net.connect(targetPort, targetHost, () => {
            console.log(`TCP connected to ${targetHost}:${targetPort}`);
        });

        tcpSocket.on('data', (data) => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(data);
            }
        });

        tcpSocket.on('end', () => {
            console.log('TCP connection ended');
            ws.close();
        });

        tcpSocket.on('error', (err) => {
            console.error('TCP error:', err.message);
            ws.close(1011, err.message);
        });

        ws.on('message', (message) => {
            if (tcpSocket.writable) {
                tcpSocket.write(Buffer.from(message));
            }
        });

        ws.on('close', () => {
            console.log('WebSocket closed');
            tcpSocket.destroy();
        });

        ws.on('error', (err) => {
            console.error('WebSocket error:', err.message);
            tcpSocket.destroy();
        });
    });

    server.listen(PORT, () => {
        console.log(`Web VNC Client: http://localhost:${PORT}`);
    });
}

startServer();
