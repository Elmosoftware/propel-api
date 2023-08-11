const { app, shell, BrowserWindow, screen, Menu, dialog } = require("electron")
const url = require("url");
const path = require("path");
const execFile = require("child_process").execFile;
const util = require("./util");
const os = require("os");
require('dotenv').config();

let mainWindow;

function createPropelRuntimeInfo(cb) {

  process.PropelRuntimeInfo = {
    processId: process.pid,
    userName: (os && os.userInfo) ? String(os.userInfo().username) : "",
    RDPUsers: [],
    error: ""
  }

  execFile('qwinsta', ['/VM'], (err, stdout, stderr) => {
      process.PropelRuntimeInfo.error = err | stderr
      process.PropelRuntimeInfo.RDPUsers = util.processQWINSTAOutput(stdout);
      process.PropelRuntimeInfo.runtimeToken = util.encrypt(process.PropelRuntimeInfo);

      cb();
  });
}

function reload() {
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'web-dist/index.html'),
    protocol: 'file:',
    slashes: true
  }));
}

function createWindow(data) {
  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    webPreferences: {
      nodeIntegration: false, /* Enabling this cause some issues with Bootstrap when 
         loading in the Electron shell.
         Check this:
          https://www.electronjs.org/docs/faq#i-can-not-use-jqueryrequirejsmeteorangularjs-in-electron
          https://techsparx.com/nodejs/electron/load-jquery-bootstrap.html
          Hopefully we can enable this with a future bootstrap releae that removes 
          JQuery dependency.
      */
      allowRunningInsecureContent: false,
      contextIsolation: false,  
      enableRemoteModule : true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  const menuTemplate = [
    {
      label: "Edit",
      submenu: [
        {
          label: "Undo",
          accelerator: "CmdOrCtrl+Z",
          role: "undo"
        },
        {
          label: "Redo",
          accelerator: "Shift+CmdOrCtrl+Z",
          role: "redo"
        },
        {
          type: "separator"
        },
        {
          label: "Cut",
          accelerator: "CmdOrCtrl+X",
          role: "cut"
        },
        {
          label: "Copy",
          accelerator: "CmdOrCtrl+C",
          role: "copy"
        },
        {
          label: "Paste",
          accelerator: "CmdOrCtrl+V",
          role: "paste"
        },
        {
          label: "Select All",
          accelerator: "CmdOrCtrl+A",
          role: "selectall"
        },
      ]
    },
    {
      label: "View",
      submenu: [
        {
          label: "Reload",
          accelerator: "CmdOrCtrl+R",
          click: function (item, focusedWindow) {
            reload();
          }
        },
        {
          label: "Toggle Full Screen",
          accelerator: (function () {
            if (process.platform === "darwin")
              return "Ctrl+Command+F";
            else
              return "F11";
          })(),
          click: function (item, focusedWindow) {
            if (focusedWindow)
              focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
          }
        },
        {
          label: "Toggle Developer Tools",
          accelerator: (function () {
            if (process.platform === "darwin")
              return "Alt+Command+I";
            else
              return "Ctrl+Shift+I";
          })(),
          click: function (item, focusedWindow) {
            if (focusedWindow)
              focusedWindow.toggleDevTools();
          }
        },
      ]
    },
    {
      label: "Window",
      role: "window",
      submenu: [
        {
          label: "Minimize",
          accelerator: "CmdOrCtrl+M",
          role: "minimize"
        },
        {
          label: "Close",
          accelerator: "CmdOrCtrl+W",
          role: "close"
        },
      ]
    },
    {
      label: "Help",
      role: "help",
      submenu: [
        //When we have a help, we can include below menu:
        // {
        //   label: "Help",
        //   click: function () { shell.openExternal("my help file or url") }
        // },
        {
          label: "About",
          click: function () {
            
            const options = {
              type: "info",
              buttons: ["Ok"],
              title: "Propel",
              message: `${app.getName()} - v${app.getVersion()}`,
              detail: `Reach your servers ${(process.PropelRuntimeInfo && process.PropelRuntimeInfo.userName) ? process.PropelRuntimeInfo.userName : ""}!`
            };

            dialog.showMessageBox(null, options, (response, checkboxChecked) => {});
          }
        },
      ]
    },
  ];

  const menu = Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(menu)

  // Open the DevTools at start, (comment out for debugging purposes if required).
  // mainWindow.webContents.openDevTools()

  reload();

  //Communicating with the render process and sending the runtime info to be stored at session level:
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('ping', ["PropelRuntimeInfo", JSON.stringify(process.PropelRuntimeInfo)])
  })

  mainWindow.on("closed", function () {
    mainWindow = null;
  })
}

function startApp() {
  //Validating the configured encryption key:
  util.validateEncryptionKey();

  //Creating the Propel runtime window, which includes the user that is running the 
  //app and also a list of RDP connected users.
  createPropelRuntimeInfo(() => {
    createWindow(); //Creating the application window.
  })
}

app.on("ready", startApp)

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("activate", function () {
  if (mainWindow === null) {
    startApp()
  }
})
