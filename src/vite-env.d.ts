/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_VERSION?: string;
  readonly VITE_NODE_VERSION?: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
  readonly hot?: {
    accept: (dep?: string | string[], cb?: () => void) => void;
    invalidate: () => void;
    dispose: (cb: () => void) => void;
    data: any;
  };
}