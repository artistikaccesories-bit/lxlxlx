const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  platform: process.platform,
  runGitCommand: (command) => ipcRenderer.invoke('run-git-command', command),
  readDataFile: (filePath) => ipcRenderer.invoke('read-data-file', filePath),
  saveDataFile: (filePath, data) => ipcRenderer.invoke('save-data-file', { filePath, data }),
  saveImageFile: (fileName, base64Data) => ipcRenderer.invoke('save-image-file', { fileName, base64Data }),
  notifyRendererReady: () => ipcRenderer.send('renderer-ready')
});
