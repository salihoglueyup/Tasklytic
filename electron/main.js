import { app, BrowserWindow } from 'electron';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn, exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let mainWindow;
let serverProcess;

function killPort(port, callback) {
    exec(`netstat -ano | findstr :${port}`, (err, stdout) => {
        if (stdout) {
            const lines = stdout.split('\n');
            lines.forEach(line => {
                const match = line.match(/LISTENING\s+(\d+)/);
                if (match) {
                    const pid = match[1];
                    console.log(`Killing process on port ${port} (PID: ${pid})`);
                    exec(`taskkill /F /PID ${pid}`, () => {});
                }
            });
        }
        setTimeout(callback, 1000);
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
        autoHideMenuBar: true,
    });

    if (!app.isPackaged) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(join(__dirname, '../dist/index.html'));
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function startServer() {
    const serverPath = join(__dirname, '../server/src/server.js');

    console.log('Starting server from:', serverPath);

    serverProcess = spawn('node', [serverPath], {
        cwd: join(__dirname, '../server'),
        env: { ...process.env, PORT: 3001 },
        shell: true
    });

    serverProcess.stdout.on('data', (data) => {
        console.log(`Server: ${data.toString()}`);
    });

    serverProcess.stderr.on('data', (data) => {
        console.error(`Server Error: ${data.toString()}`);
    });

    serverProcess.on('error', (error) => {
        console.error('Failed to start server:', error);
    });
}

app.on('ready', () => {
    console.log('✨ Electron başlatıldı!');

    // Development mode: Backend çalışıyor kabul et
    if (!app.isPackaged) {
        console.log('📡 Backend http://localhost:3001 üzerinde bekleniyor...');
        setTimeout(createWindow, 2000);
    } else {
        // Production mode: Backend'i başlat
        startServer();
        setTimeout(createWindow, 3000);
    }
});

app.on('window-all-closed', () => {
    if (serverProcess) {
        serverProcess.kill();
    }
    app.quit();
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

app.on('before-quit', () => {
    if (serverProcess) {
        serverProcess.kill();
    }
});