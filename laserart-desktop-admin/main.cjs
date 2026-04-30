const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');

// Use Electron default GPU behavior; some systems render blank with forced disable.

const logPath = path.join(app.getPath('desktop'), 'laserart_debug_log.txt');
function log(msg) {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logPath, `[${timestamp}] ${msg}\n`);
}

log("--- NEW SESSION ---");
log("App starting with Custom Protocol support...");

let mainWindow;
let splashWindow;
let rendererReady = false;

function loadEmergencyUi(reason) {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  const safeReason = String(reason || "Unknown startup issue").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const emergencyHtml = `
    <!doctype html>
    <html>
      <body style="margin:0;background:#0b0b0b;color:#fff;font-family:Segoe UI,Arial,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;">
        <div style="max-width:640px;padding:24px;border:1px solid #333;border-radius:14px;background:#121212;">
          <h1 style="margin:0 0 10px 0;font-size:26px;">Laser Art LB Recovery</h1>
          <p style="opacity:.85;line-height:1.5;">The dashboard took too long to render. This fallback keeps the app usable.</p>
          <p style="font-size:12px;opacity:.65;margin-top:8px;">Reason: ${safeReason}</p>
          <div style="display:flex;gap:10px;margin-top:18px;">
            <button onclick="location.reload()" style="padding:10px 14px;border-radius:8px;border:none;background:#fff;color:#111;font-weight:700;cursor:pointer;">Reload Dashboard</button>
            <button onclick="window.close()" style="padding:10px 14px;border-radius:8px;border:1px solid #444;background:#111;color:#fff;cursor:pointer;">Close App</button>
          </div>
        </div>
      </body>
    </html>
  `;
  mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(emergencyHtml)}`);
}

const isLock = app.requestSingleInstanceLock();
if (!isLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

app.setAppUserModelId('com.laserart.admin');

// Git IPC handler
ipcMain.handle('run-git-command', async (event, command) => {
  return new Promise((resolve, reject) => {
    const projectRoot = 'c:\\Users\\Alex\\Desktop\\lxlxlx-main';
    exec(command, { cwd: projectRoot }, (error, stdout, stderr) => {
      if (error) reject(stderr || error.message);
      else resolve(stdout);
    });
  });
});

// File Read IPC handler
ipcMain.handle('read-data-file', async (event, filePath) => {
  return new Promise((resolve, reject) => {
    const projectRoot = 'c:\\Users\\Alex\\Desktop\\lxlxlx-main';
    const absolutePath = path.resolve(projectRoot, filePath);
    if (!fs.existsSync(absolutePath)) {
      resolve("");
      return;
    }
    fs.readFile(absolutePath, 'utf8', (err, data) => {
      if (err) reject(err.message);
      else resolve(data);
    });
  });
});

// File Save IPC handler (JSON)
ipcMain.handle('save-data-file', async (event, { filePath, data }) => {
  return new Promise((resolve, reject) => {
    const projectRoot = 'c:\\Users\\Alex\\Desktop\\lxlxlx-main';
    const absolutePath = path.resolve(projectRoot, filePath);
    const dir = path.dirname(absolutePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFile(absolutePath, data, (err) => {
      if (err) reject(err.message);
      else resolve(true);
    });
  });
});

// Image Save IPC handler (Buffer)
ipcMain.handle('save-image-file', async (event, { fileName, base64Data }) => {
  return new Promise((resolve, reject) => {
    const projectRoot = 'c:\\Users\\Alex\\Desktop\\lxlxlx-main';
    const absolutePath = path.join(projectRoot, 'public', 'images', fileName);
    const dir = path.dirname(absolutePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFile(absolutePath, buffer, (err) => {
      if (err) reject(err.message);
      else resolve(`/images/${fileName}`);
    });
  });
});

function createWindow() {
  log("Creating window...");
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const splashX = Math.round(width / 2 - 220);
  const splashY = Math.round(height / 2 - 120);

  splashWindow = new BrowserWindow({
    width: 440,
    height: 240,
    x: splashX,
    y: splashY,
    frame: false,
    transparent: false,
    resizable: false,
    alwaysOnTop: true,
    show: true,
    backgroundColor: '#0a0a0a',
  });
  splashWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(`
    <!doctype html>
    <html>
      <head>
        <style>
          body {
            margin: 0;
            background: radial-gradient(circle at 50% 35%, #1f1f1f 0%, #0a0a0a 55%, #050505 100%);
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: Segoe UI, Arial, sans-serif;
            height: 100vh;
            overflow: hidden;
          }
          .wrap { text-align: center; }
          .logo {
            font-size: 42px;
            font-weight: 900;
            letter-spacing: 3px;
            color: #f7f7f7;
            text-shadow:
              0 0 6px rgba(255,255,255,.8),
              0 0 16px rgba(255,255,255,.55),
              0 0 28px rgba(255,90,90,.45),
              0 0 42px rgba(255,70,70,.28);
            animation: pulse 1.6s ease-in-out infinite;
          }
          .sub {
            margin-top: 12px;
            opacity: .85;
            letter-spacing: .7px;
            font-size: 14px;
          }
          .bar {
            margin: 18px auto 0;
            width: 220px;
            height: 4px;
            border-radius: 99px;
            background: rgba(255,255,255,.12);
            overflow: hidden;
          }
          .bar::after {
            content: "";
            display: block;
            width: 45%;
            height: 100%;
            border-radius: 99px;
            background: linear-gradient(90deg, rgba(255,255,255,.95), rgba(255,95,95,.95));
            animation: move 1.2s linear infinite;
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.03); opacity: .92; }
          }
          @keyframes move {
            0% { transform: translateX(-120%); }
            100% { transform: translateX(280%); }
          }
        </style>
      </head>
      <body>
        <div class="wrap">
          <div class="logo">LASER ART LB</div>
          <div class="sub">Initializing Admin Dashboard...</div>
          <div class="bar"></div>
        </div>
      </body>
    </html>
  `)}`);

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 850,
    show: false,
    backgroundColor: '#0a0a0a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      sandbox: false 
    },
    title: "Laser Art LB Admin",
    autoHideMenuBar: true,
  });

  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.type === 'keyDown' && input.key === 'F12') {
      mainWindow.webContents.toggleDevTools();
    }
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    const fallbackPath = path.join(__dirname, 'dist', 'index.html');
    log(`Loading via file path: ${fallbackPath}`);
    mainWindow.loadFile(fallbackPath).catch((err) => {
      log(`CRITICAL: loadFile failed: ${err.message}`);
    });
  }

  mainWindow.once('ready-to-show', () => {
    log("Window ready-to-show event fired.");
    if (rendererReady) {
      if (splashWindow && !splashWindow.isDestroyed()) splashWindow.close();
      mainWindow.center();
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    log(`RENDERER ERROR: Failed to load (${errorCode}): ${errorDescription}`);
  });

  mainWindow.webContents.on('did-finish-load', () => {
    log("Renderer content finished loading.");
  });

  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    log(`RENDERER LOG [${level}]: ${message} (at ${sourceId}:${line})`);
  });

  // If renderer never signals ready, still show app after timeout.
  setTimeout(() => {
    if (mainWindow) {
      if (!mainWindow.isVisible()) {
        log("Visibility timeout reached. Forcing show.");
        if (splashWindow && !splashWindow.isDestroyed()) splashWindow.close();
        mainWindow.center();
        mainWindow.show();
        mainWindow.focus();
      } else {
        log("Visibility check: Window is visible.");
      }
    }
  }, 8000);

  setTimeout(() => {
    if (!rendererReady && mainWindow && !mainWindow.isDestroyed()) {
      log("Renderer ready timeout reached. Showing emergency fallback UI.");
      if (splashWindow && !splashWindow.isDestroyed()) splashWindow.close();
      mainWindow.show();
      mainWindow.focus();
      loadEmergencyUi("Renderer did not send ready signal in time.");
    }
  }, 15000);
}

ipcMain.on('renderer-ready', () => {
  rendererReady = true;
  log('Renderer signaled ready.');
  if (mainWindow && !mainWindow.isVisible()) {
    if (splashWindow && !splashWindow.isDestroyed()) splashWindow.close();
    mainWindow.center();
    mainWindow.show();
    mainWindow.focus();
  }
});

app.on('ready', () => {
    log("App ready event received.");
    setTimeout(createWindow, 300);
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

process.on('uncaughtException', (error) => {
    log(`PROCESS ERROR: ${error.message}`);
});
