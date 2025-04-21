
import { createDerivWebSocket } from "./derivWebSocket.ts";

export function createDerivSocket(clientSocket: WebSocket): WebSocket {
  const ws = createDerivWebSocket(clientSocket, {
    onMessage: (data: any) => {
      // Processamento adicional se necessário
    },
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

  // Ouvir mensagens do cliente para mudar símbolos
  clientSocket.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      
      // Processar comandos do cliente
      if (message.action === "changeSymbol" && message.symbol) {
        (ws as any).changeSymbol(message.symbol);
        clientSocket.send(JSON.stringify({ 
          type: "symbolChanged", 
          symbol: message.symbol 
        }));
      }
    } catch (err) {
      // Ignorar mensagens inválidas
    }
  };

  return ws;
}
