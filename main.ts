import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createDerivSocket } from "./services/wsHandler.ts";
import { getCandles, getCSV } from "./services/candleStorage.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  const { pathname } = new URL(req.url);

  if (req.method === "GET" && pathname.startsWith("/export/")) {
    const [, , symbol, format] = pathname.split("/");
    if (!symbol || !format) return new Response("Parâmetros inválidos", { status: 400 });

    if (format === "json") {
      return new Response(JSON.stringify(getCandles(symbol)), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (format === "csv") {
      return new Response(getCSV(symbol), {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename=${symbol}.csv`,
        },
      });
    }
  }

  if (pathname === "/") {
    const html = await Deno.readTextFile("./static/index.html");
    return new Response(html, {
      status: 200,
      headers: { "content-type": "text/html" },
    });
  }

  const upgrade = req.headers.get("upgrade") || "";
  if (upgrade.toLowerCase() !== "websocket") {
    return new Response("WebSocket expected", {
      status: 400,
      headers: { "Content-Type": "text/plain" },
    });
  }

  try {
    const { socket: clientSocket, response } = Deno.upgradeWebSocket(req);
    createDerivSocket(clientSocket);
    return response;
  } catch (err) {
    return new Response("Failed to upgrade WebSocket", { status: 500 });
  }
});