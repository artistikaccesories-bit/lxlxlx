const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  platform: process.platform,
  runGitCommand: (command) => ipcRenderer.invoke('run-git-command', command),
  saveDataFile: (filePath, data) => ipcRenderer.invoke('save-data-file', { filePath, data })
});
