'use strict';
const path = require('path');
const {app, BrowserWindow, ipcMain} = require('electron');
/// const {autoUpdater} = require('electron-updater');
const {is} = require('electron-util');
const unhandled = require('electron-unhandled');
// use to run sheel command
const spawn = require("child_process").spawn;

const pyEntryPoint = './test.py';

unhandled();

// Note: Must match `build.appId` in package.json
app.setAppUserModelId('com.company.AppName');

// Uncomment this before publishing your first version.
// It's commented out as it throws an error if there are no published versions.
// if (!is.development) {
// 	const FOUR_HOURS = 1000 * 60 * 60 * 4;
// 	setInterval(() => {
// 		autoUpdater.checkForUpdates();
// 	}, FOUR_HOURS);
//
// 	autoUpdater.checkForUpdates();
// }

// Prevent window from being garbage collected
let mainWindow;

const createMainWindow = async () => {
	const win = new BrowserWindow({
		title: app.name,
		width: 1000,
		show: false,
		webPreferences: {
			nodeIntegration: true
		}
	});

	win.on('ready-to-show', () => {
		win.show();
	});

	win.on('closed', () => {
		// Dereference the window
		// For multiple windows store them in an array
		mainWindow = undefined;
	});

	await win.loadFile(path.join(__dirname, 'index.html'));

	return win;
};

// Prevent multiple instances of the app
if (!app.requestSingleInstanceLock()) {
	app.quit();
}

app.on('second-instance', () => {
	if (mainWindow) {
		if (mainWindow.isMinimized()) {
			mainWindow.restore();
		}

		mainWindow.show();
	}
});

app.on('window-all-closed', () => {
	if (!is.macos) {
		app.quit();
	}
});

app.on('activate', async () => {
	if (!mainWindow) {
		mainWindow = await createMainWindow();
	}
});

(async () => {
	await app.whenReady();
	mainWindow = await createMainWindow();
})();

ipcMain.on('startDetection', (event, data) => {
	var process = spawn('python',[pyEntryPoint, data] );
	process.stdout.on('data', function(data) { 
	console.log(data.toString());
		mainWindow.webContents.send('resultSent', data.toString());
    });
});
