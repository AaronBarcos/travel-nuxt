import { getTransports } from '../../utils/mcp-server';

export default defineEventHandler(async (event) => {
  const sessionId = getHeader(event, 'mcp-session-id');
  const transports = getTransports();
  const body = await readBody(event);

  if (!sessionId || !transports[sessionId]) {
    setResponseStatus(event, 400);
    return {
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Bad Request: No valid session ID provided",
      },
      id: body?.id,
    };
  }

  console.log(`🗑️ Recibida petición de terminación de sesión para ${sessionId}`);

  try {
    const transport = transports[sessionId];
    await transport.handleRequest(event.node.req, event.node.res);
  } catch (error) {
    console.error("❌ Error al terminar sesión:", error);
    
    setResponseStatus(event, 500);
    return {
      jsonrpc: "2.0",
      error: {
        code: -32603,
        message: "Error handling session termination",
      },
      id: body?.id,
    };
  }
});
