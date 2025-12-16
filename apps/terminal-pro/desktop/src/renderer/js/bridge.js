// DX niceties: Typed bridge wrapper
export const Bridge = {
  openExternal: (url) => window.bridge?.openExternal(url),
  version: () => window.bridge?.getAppVersion(),
  readConfig: (parts) => window.bridge?.readTextFile('config', parts),
  homeJoin: (parts) => window.bridge?.joinPath('home', parts),
};
