export {};

declare global {
  var __ioServer: import("socket.io").Server | undefined;
}
