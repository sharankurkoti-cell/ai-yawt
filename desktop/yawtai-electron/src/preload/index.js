const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // User settings
  getUserSettings: () => ipcRenderer.invoke('get-user-settings'),
  saveUserSettings: (settings) => ipcRenderer.invoke('save-user-settings', settings),
  
  // API key management
  getApiKey: () => ipcRenderer.invoke('get-api-key'),
  saveApiKey: (apiKey) => ipcRenderer.invoke('save-api-key', apiKey),
  
  // Menu events
  onMenuAction: (callback) => {
    ipcRenderer.on('menu-new-project', callback);
    ipcRenderer.on('menu-open-project', callback);
  },
  
  // File operations
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  
  // App info
  getVersion: () => ipcRenderer.invoke('get-version'),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});
