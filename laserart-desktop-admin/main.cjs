const { app, BrowserWindow, ipcMain, protocol, net } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');
const url = require('url');
const { pathToFileURL } = require('url');

// PERSISTENT FIX: Explicitly disable hardware acceleration and other GPU features
// as they are the primary cause of black screens on Windows.
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-software-rasterizer');
app.commandLine.appendSwitch('disable-gpu-compositing');
app.commandLine.appendSwitch('disable-gpu-rasterization');
app.commandLine.appendSwitch('disable-gpu-sandbox');
app.commandLine.appendSwitch('no-sandbox');

const logPath = path.join(app.getPath('desktop'), 'laserart_debug_log.txt');
function log(msg) {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logPath, `[${timestamp}] ${msg}\n`);
}

log("--- NEW SESSION ---");
log("App starting with Custom Protocol support...");

let mainWindow;

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
    const projectRoot = path.join(__dirname, '..');
    exec(command, { cwd: projectRoot }, (error, stdout, stderr) => {
      if (error) reject(stderr || error.message);
      else resolve(stdout);
    });
  });
});

// File Save IPC handler
ipcMain.handle('save-data-file', async (event, { filePath, data }) => {
  return new Promise((resolve, reject) => {
    const absolutePath = path.resolve(__dirname, '..', filePath);
    const dir = path.dirname(absolutePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFile(absolutePath, JSON.stringify(data, null, 2), (err) => {
      if (err) reject(err.message);
      else resolve(true);
    });
  });
});

function createWindow() {
  log("Creating window...");
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
    title: "LaserArt Admin",
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
    // USE CUSTOM 'app' PROTOCOL
    // This is significantly more stable than file:// on Windows
    log("Loading via custom 'app' protocol...");
    mainWindow.loadURL('app://index.html').catch(err => {
      log(`CRITICAL: loadURL failed: ${err.message}`);
      // Emergency fallback to file protocol if app protocol fails
      const fallbackPath = path.join(__dirname, 'dist', 'index.html');
      log(`Attempting emergency fallback to: ${fallbackPath}`);
      mainWindow.loadFile(fallbackPath);
    });
  }

  mainWindow.once('ready-to-show', () => {
    log("Window ready-to-show event fired.");
    mainWindow.show();
    mainWindow.focus();
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

  // Re-show timer: More aggressive to ensure visibility
  setTimeout(() => {
    if (mainWindow) {
      if (!mainWindow.isVisible()) {
        log("Visibility timeout reached. Forcing show (Window was hidden).");
        mainWindow.show();
        mainWindow.focus();
      } else {
        log("Visibility check: Window is visible.");
      }
    }
  }, 3000);
}

// Handle protocol registration before app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, allowServiceWorkers: true, supportFetchAPI: true, corsEnabled: true, stream: true } }
]);

app.on('ready', () => {
    log("App ready event received.");
    
    // Register the custom 'app' protocol to serve the dist folder
    // This solves many Black Screen and White Screen issues by providing a consistent origin
    protocol.registerFileProtocol('app', (request, callback) => {
      try {
        // Strip app:// prefix
        let urlPath = request.url.replace(/^app:\/\/[\/]?/, '');
        urlPath = urlPath.split('?')[0].split('#')[0];

        // CRITICAL FIX: If browser treats index.html as a directory, strip it
        if (urlPath.startsWith('index.html/')) {
          urlPath = urlPath.substring(11);
        }
        
        if (!urlPath || urlPath === '' || urlPath === 'index.html') urlPath = 'index.html';
        
        const filePath = path.normalize(path.join(__dirname, 'dist', urlPath));
        log(`Protocol Request: ${request.url} -> ${filePath}`);
        
        // Explicitly set MIME types for ESM compatibility
        const ext = path.extname(filePath).toLowerCase();
        let mimeType = 'text/html';
        if (ext === '.js' || ext === '.mjs') mimeType = 'application/javascript';
        else if (ext === '.css') mimeType = 'text/css';
        else if (ext === '.svg') mimeType = 'image/svg+xml';
        else if (ext === '.png') mimeType = 'image/png';
        else if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
        else if (ext === '.json') mimeType = 'application/json';
        else if (ext === '.woff' || ext === '.woff2') mimeType = 'font/woff2';

        if (fs.existsSync(filePath)) {
          callback({ path: filePath, mimeType });
        } else {
          log(`PROTOCOL ERROR: File not found: ${filePath}`);
          // Fallback to index.html for SPA routing if it looks like a route (no extension)
          if (!ext) {
             callback({ path: path.join(__dirname, 'dist', 'index.html'), mimeType: 'text/html' });
          } else {
             callback({ error: -6 }); // net::ERR_FILE_NOT_FOUND
          }
        }
      } catch (err) {
        log(`PROTOCOL ERROR: Exception: ${err.message}`);
      }
    });

    // Small delay ensures the protocol is fully registered before we try to load the URL
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
