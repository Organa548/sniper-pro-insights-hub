import { createDerivWebSocket } from "./derivWebSocket.ts";

export function createDerivSocket(clientSocket: WebSocket): WebSocket {
  const ws = createDerivWebSocket(clientSocket, {
    onMessage: () => {},
    onError: (error: any) => {
      clientSocket.send(JSON.stringify({ type: "error", message: error?.message || "Erro desconhecido" }));
    },
    onClose: (event: CloseEvent) => {
      clientSocket.send(JSON.stringify({
        type: "connection",
        status: "disconnected",
        reason: event.reason
      }));
    },
    onOpen: () => {
      clientSocket.send(JSON.stringify({
        type: "connection",
        status: "connected",
        message: "Deriv WebSocket conectado e autorizado"
      }));
    }
  });

  return ws;
}