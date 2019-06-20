const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain} = electron;

// Set environement
process.env.NODE_ENV = 'production';

let mainWindow;
let addWindow

// Listen for app ready
app.on('ready', function(){
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    }
  });
  // Load HTML file
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'mainWindow.html'),
    protocol: 'file',
    slashes: true
  }));
  // Quit app when closed
  mainWindow.on('closed', function(){
    app.quit();
  });
  // Build memu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  // Insert Menu
  Menu.setApplicationMenu(mainMenu);
});

// Handle add window
function createAddWindow() {
    addWindow = new BrowserWindow({
    width: 300,
    height: 200,
    title: 'Add To-do item',
    webPreferences: {
      nodeIntegration: true
    }
  });
  // Load HTML file
  addWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'addWindow.html'),
    protocol: 'file',
    slashes: true
  }));
  // Garbage collection
  addWindow.on('close', function() {
    addWindow = null;
  });
}

// Catch item from ipcRenderer
ipcMain.on('item:add', function(e, item) {
  mainWindow.webContents.send('item:add', item);
  addWindow.close();
});

// Create menu template
const mainMenuTemplate = [
  {
    label:'File',
    submenu: [
      {
        label: 'Add to-do',
        click() {
          createAddWindow();
        }
      },
      {
        label: 'Clear all',
        click() {
          mainWindow.webContents.send('item:clear');
        }
      },
      {
        label: 'Quit',
        accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
        click(){
          app.quit();
        }
      }
    ]
  }
];

if(process.platform == 'darwin') {
  mainMenuTemplate.unshift({});
};

// add developer tools item if not in production
if(process.env.NODE_ENV !== 'production') {
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu: [
      {
        label: 'Toggle DevTools',
        accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
        click(item, focusedWindow){
          focusedWindow.toggleDevTools();
        }
      },
      {
        role: 'reload',
        accelerator: process.platform == 'darwin' ? 'Command+R' : 'Ctrl+R'
      }
    ]
  })
}
