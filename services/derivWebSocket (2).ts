import { storeCandle } from "./candleStorage.ts";

const DERIV_APP_ID = "71759";
const DERIV_API_TOKEN = "o0gAeZLjNIL3CuS";
const DERIV_WS_URL = `wss://ws.derivws.com/websockets/v3?app_id=${DERIV_APP_ID}`;

export function createDerivWebSocket(clientSocket: WebSocket, opts: any): WebSocket {
  const derivSocket = new WebSocket(DERIV_WS_URL);
  let symbol = "R_50";

  derivSocket.onopen = () => {
    derivSocket.send(JSON.stringify({ authorize: DERIV_API_TOKEN }));
  };

  derivSocket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.msg_type === "authorize") {
      derivSocket.send(JSON.stringify({
        ticks_history: symbol,
        style: "candles",
        granularity: 60,
        count: 1,
        subscribe: 1
      }));
      if (opts.onOpen) opts.onOpen(derivSocket);
    }

    if (data.msg_type === "candles") {
      const candle = data.candles[0];
      storeCandle(symbol, candle);
      clientSocket.send(JSON.stringify({ type: "candle", symbol, data: candle }));
    }

    if (data.error) {
      clientSocket.send(JSON.stringify({ type: "error", message: data.error.message }));
    }

    opts.onMessage(data, derivSocket);
  };

  derivSocket.onerror = (err) => {
    if (opts.onError) opts.onError(err, derivSocket);
  };

  derivSocket.onclose = (event) => {
    if (opts.onClose) opts.onClose(event, derivSocket);
  };

  return derivSocket;
}