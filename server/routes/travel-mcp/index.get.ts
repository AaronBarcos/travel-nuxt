import { getTransports } from '../../utils/mcp-server';

export default defineEventHandler(async (event) => {
  console.log("📥 Recibida petición MCP GET");
  
  const sessionId = getHeader(event, 'mcp-session-id');
  const transports = getTransports();

  if (!sessionId || !transports[sessionId]) {
    setResponseStatus(event, 400);
    return {
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Bad Request: No valid session ID provided",
      },
    };
  }

  const lastEventId = getHeader(event, 'last-event-id');
  if (lastEventId) {
    console.log(`🔁 Cliente reconectando con Last-Event-ID: ${lastEventId}`);
  } else {
    console.log(`🌐 Estableciendo nuevo SSE para sesión ${sessionId}`);
  }

  const transport = transports[sessionId];
  await transport.handleRequest(event.node.req, event.node.res);
});
