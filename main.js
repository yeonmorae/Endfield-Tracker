const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let win;
function createWindow() {
  win = new BrowserWindow({
    width: 900,
    height: 650,
    alwaysOnTop: false,
    transparent: false,
    opacity: 1.0,
    frame: true,
    icon: path.join(__dirname, 'endfield_icon.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile('index.html');
  win.setMenuBarVisibility(false);
}

ipcMain.on('toggle-always-on-top', (event, arg) => {
  if (win) win.setAlwaysOnTop(arg);
});

ipcMain.on('change-opacity', (event, opacity) => {
  if (win) win.setOpacity(parseFloat(opacity));
});

app.whenReady().then(createWindow);