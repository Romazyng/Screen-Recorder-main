const { ipcMain, app, BrowserWindow, Menu} = require('electron');
const path = require('path');
const url = require('url');

if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const { template } = require('./menu/menu-functions')

// const iconUrl = url.format({
//  pathname: path.join(__dirname, 'src/img/logo.png'),
//  protocol: 'file:',
//  slashes: true
// })

const createWindow = () => {
  // create the browser window
  const mainWindow = new BrowserWindow({
    width: 1000,
    minHeight: 730,
    maxWidth: 1600,
    maxHeight: 750,
    icon: 'src/img/icon.ico',
    webPreferences: {
      nodeIntegration: true, // if true, gets you the 'require is not defined' error
      devTools: true, // removes devtools bar
    },
  frame: false

  });
  // and load the index.html of the app
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the devtools
  mainWindow.webContents.openDevTools();
};
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

ipcMain.on('display-app-menu', (event, arg) => {
  const appMenu = Menu.buildFromTemplate[template]

  if (mainWindow) {
    appMenu.popup(mainWindow, arg.x, arg.y)
  }
})

ipcMain.handle('getOperatingSystem', () => {
  return process.platform
})

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
