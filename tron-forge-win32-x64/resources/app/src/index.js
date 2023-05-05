const { ipcMain, app, BrowserWindow } = require('electron');
const path = require('path');

if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const createWindow = () => {
  // create the browser window
  const mainWindow = new BrowserWindow({
    width: 1000,
    minHeight: 730,
    maxWidth: 1600,
    maxHeight: 750,
    webPreferences: {
      nodeIntegration: true, // if true, gets you the 'require is not defined' error
      devTools: false // removes devtools bar
    },
  frame: false

  });
  // and load the index.html of the app
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the devtools
  mainWindow.webContents.openDevTools();
};

ipcMain.on(`display-app-menu`, function(e, args) {
  if (isWindows && mainWindow) {
    menu.popup({
      window: mainWindow,
      x: args.x,
      y: args.y
    });
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

