const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 860,
    height: 700,
    useContentSize: true,
    resizable: true,
    title: "Naruto & Sasuke: Retro Ninja Chronicles",
    icon: path.join(__dirname, 'icon.ico'), // Optional icon
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Load index.html
  mainWindow.loadFile('index.html');

  // Hide the default application menu bar (File, Edit, etc.) for a clean console game feel
  mainWindow.removeMenu();

  // Uncomment below to open DevTools for debugging:
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
