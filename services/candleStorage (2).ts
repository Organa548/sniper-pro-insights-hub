const candleData: Record<string, any[]> = {};

export function storeCandle(symbol: string, candle: any) {
  if (!candleData[symbol]) candleData[symbol] = [];
  candleData[symbol].push(candle);
  if (candleData[symbol].length > 1000) candleData[symbol].shift();
}

export function getCandles(symbol: string) {
  return candleData[symbol] || [];
}

export function getCSV(symbol: string) {
  const candles = getCandles(symbol);
  const headers = "epoch,open,high,low,close";
  const lines = candles.map(c => `${c.epoch},${c.open},${c.high},${c.low},${c.close}`);
  return [headers, ...lines].join("\n");
}