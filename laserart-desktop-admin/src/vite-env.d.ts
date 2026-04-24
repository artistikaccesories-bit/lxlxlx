/// <reference types="vite/client" />

declare global {
  interface Window {
    electron: {
      platform: string;
      runGitCommand: (command: string) => Promise<string>;
      saveDataFile: (filePath: string, data: any) => Promise<boolean>;
    };
  }
}

export {};
