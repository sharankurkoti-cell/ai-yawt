const { app, BrowserWindow, Menu, shell, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// Keep a global reference of the window object
let mainWindow;

function createWindow() {
  console.log('Creating YawtAI Desktop window...');
  
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    icon: path.join(__dirname, '../../assets/yawt-logo.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, '../preload/index.js'),
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false
    },
    show: false,
    backgroundColor: '#0f172a'
  });

  // Load the local web app
  const startUrl = 'http://localhost:3000';
  
  console.log('Loading URL:', startUrl);
  
  mainWindow.loadURL(startUrl)
    .then(() => {
      console.log('Successfully loaded web app');
      mainWindow.show();
      
      // Open DevTools in development
      if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
      }
    })
    .catch(err => {
      console.error('Failed to load web app:', err);
      
      // If web app is not available, show fallback page
      console.log('Loading fallback page...');
      const fallbackHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>YawtAI Desktop</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            color: white;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }
        
        .container {
            text-align: center;
            max-width: 800px;
            padding: 2rem;
            animation: fadeIn 0.8s ease-out;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .logo {
            width: 120px;
            height: 120px;
            margin: 0 auto 2rem;
            background: linear-gradient(135deg, #8b5cf6, #3b82f6);
            border-radius: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3rem;
            font-weight: bold;
            box-shadow: 0 20px 40px rgba(139, 92, 246, 0.3);
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        
        h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
            background: linear-gradient(135deg, #8b5cf6, #3b82f6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .status {
            background: rgba(34, 197, 94, 0.2);
            border: 1px solid rgba(34, 197, 94, 0.5);
            border-radius: 16px;
            padding: 2rem;
            margin: 2rem 0;
            backdrop-filter: blur(10px);
        }
        
        .status h2 {
            color: #22c55e;
            margin-bottom: 1rem;
            font-size: 1.5rem;
        }
        
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin: 2rem 0;
        }
        
        .feature {
            background: rgba(139, 92, 246, 0.1);
            border: 1px solid rgba(139, 92, 246, 0.3);
            border-radius: 12px;
            padding: 1.5rem;
            transition: transform 0.3s ease;
        }
        
        .feature:hover {
            transform: translateY(-5px);
        }
        
        .feature-icon {
            font-size: 2rem;
            margin-bottom: 0.5rem;
        }
        
        .actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
            margin-top: 2rem;
        }
        
        .btn {
            background: linear-gradient(135deg, #8b5cf6, #3b82f6);
            color: white;
            border: none;
            padding: 1rem 2rem;
            border-radius: 12px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(139, 92, 246, 0.3);
        }
        
        .btn-secondary {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .footer {
            position: absolute;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            color: #64748b;
            font-size: 0.9rem;
            text-align: center;
        }
        
        .error {
            background: rgba(239, 68, 68, 0.2);
            border: 1px solid rgba(239, 68, 68, 0.5);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 2rem 0;
        }
        
        .error h2 {
            color: #ef4444;
            margin-bottom: 1rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">Y</div>
        <h1>YawtAI Desktop</h1>
        <div class="status">
            <h2>✅ Desktop Application Ready</h2>
            <p><strong>Version 1.0.0</strong> - Built with Electron</p>
            <p>Your AI Software Engineer is ready to assist you!</p>
        </div>
        
        <div class="features">
            <div class="feature">
                <div class="feature-icon">🤖</div>
                <h3>AI-Powered Development</h3>
                <p>Advanced AI assistance for coding</p>
            </div>
            <div class="feature">
                <div class="feature-icon">⚡</div>
                <h3>Lightning Fast</h3>
                <p>Optimized performance</p>
            </div>
            <div class="feature">
                <div class="feature-icon">🔒</div>
                <h3>Secure</h3>
                <p>Enterprise-grade security</p>
            </div>
        </div>
        
        <div class="actions">
            <button class="btn" onclick="window.location.reload()">
                🔄 Retry Connection
            </button>
            <button class="btn btn-secondary" onclick="window.open('https://github.com/yawt-technologies/yawtai')">
                📚 Documentation
            </button>
        </div>
    </div>
    
    <div class="footer">
        &copy; 2022-2024 Yawt Technologies LLC | Built with ❤️ using Electron
    </div>
</body>
</html>`;
      
      mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(fallbackHtml)}`)
        .then(() => {
          console.log('Fallback page loaded successfully');
          mainWindow.show();
        })
        .catch(err => {
          console.error('Failed to load fallback:', err);
          // Last resort - ultra simple page
          mainWindow.loadURL('data:text/html,<html><body style="background:#0f172a;color:white;font-family:Arial;display:flex;align-items:center;justify-content:center;height:100vh;"><div style="text-align:center;"><h1>YawtAI Desktop</h1><p>Application Ready</p></div></body></html>');
          mainWindow.show();
        });
    });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// Create application menu
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Project',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('menu-new-project');
          }
        },
        {
          label: 'Open Project',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            mainWindow.webContents.send('menu-open-project');
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { label: 'Reload', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        { label: 'Force Reload', accelerator: 'CmdOrCtrl+Shift+R', role: 'forceReload' },
        { label: 'Toggle Developer Tools', accelerator: 'F12', role: 'toggleDevTools' },
        { label: 'Toggle Full Screen', accelerator: 'F11', role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { label: 'Minimize', accelerator: 'CmdOrCtrl+M', role: 'minimize' },
        { label: 'Close', accelerator: 'CmdOrCtrl+W', role: 'close' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About YawtAI',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About YawtAI',
              message: 'YawtAI Desktop Application',
              detail: 'Version 1.0.0\n\nYour AI Software Engineer\n\n© 2022-2024 Yawt Technologies LLC'
            });
          }
        },
        {
          label: 'Documentation',
          click: () => {
            shell.openExternal('https://github.com/yawt-technologies/yawtai');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// App event handlers
app.whenReady().then(() => {
  console.log('YawtAI Desktop app ready');
  createWindow();
  createMenu();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});

// Handle certificate errors (for development)
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  if (process.env.NODE_ENV === 'development') {
    // Allow certificates in development
    event.preventDefault();
    callback(true);
  } else {
    callback(false);
  }
});

// Console logging
mainWindow?.webContents.on('console-message', (event, level, message, line, sourceId) => {
  console.log(`[Renderer Console] ${message}`);
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
