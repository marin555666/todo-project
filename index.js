const electron = require("electron");

const { app, BrowserWindow, Menu, ipcMain } = electron;

let mainWindow;
let addWindow;

app.on("ready", () => {
  mainWindow = new BrowserWindow({ webPreferences: { nodeIntegration: true, contextIsolation: false } });
  mainWindow.loadURL(`file://${__dirname}/html/main.html`);
  mainWindow.on("closed", () => app.quit());

  const mainMenu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(mainMenu);
});

function createAddWindow() {
  addWindow = new BrowserWindow({
    webPreferences: { nodeIntegration: true, contextIsolation: false },
    width: 300,
    height: 200,
    title: "Add new ToDo",
  });

  addWindow.loadURL(`file://${__dirname}/html/add.html`);
  process.env.NODE_ENV !== "production"
    ? addWindow.setMenu(Menu.buildFromTemplate([debugMenuTemplate]))
    : addWindow.setMenu(null);

  addWindow.on("closed", () => (appWindow = null));
}

ipcMain.on("todo:add", (event, todo) => {
  mainWindow.webContents.send("todo:add", todo);
  addWindow.close();
});

const menuTemplate = [
  {
    label: "File",
    submenu: [
      {
        label: "New Todo",
        click() {
          createAddWindow();
        },
      },
      {
        label: "Clear Todos",
        click() {
          mainWindow.webContents.send("todo:clear");
        },
      },
      {
        label: "Quit",
        accelerator: process.platform === "darwin" ? "Command+Q" : "Ctrl+Q",
        click() {
          app.quit();
        },
      },
    ],
  },
];

const debugMenuTemplate = {
  label: "Debug",
  submenu: [
    { role: "reload" },
    {
      label: "Toggle Developer Tools",
      accelerator: process.platform === "darwin" ? "Comman+Alt+I" : "Ctrl+Shift+I",
      click(item, focusedWindow) {
        focusedWindow.toggleDevTools();
      },
    },
  ],
};

if (process.platform === "darwin") {
  menuTemplate.unshift({});
}

if (process.env.NODE_ENV !== "production") {
  menuTemplate.push(debugMenuTemplate);
}
