import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { getMcpServer, getTransports, createTransport } from '../../utils/mcp-server';

export default defineEventHandler(async (event) => {
  console.log("📨 Recibida petición MCP POST");
  
  const body = await readBody(event);
  console.log("📦 Cuerpo de la petición:", body);

  try {
    const sessionId = getHeader(event, 'mcp-session-id');
    console.log(`🔑 Procesando para session ID: ${sessionId}`);

    const transports = getTransports();
    const server = getMcpServer();

    if (sessionId && transports[sessionId]) {
      console.log(`🔄 Reutilizando transport para sesión ${sessionId}`);
      const transport = transports[sessionId];
      await transport.handleRequest(event.node.req, event.node.res, body);
      return;
    }

    if (!sessionId && isInitializeRequest(body)) {
      console.log("🆕 Sin session ID, inicializando nuevo transport");
      
      const transport = createTransport(server);
      await server.connect(transport);
      await transport.handleRequest(event.node.req, event.node.res, body);
      return;
    }

    return {
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Bad Request: No valid session ID provided",
      },
      id: body?.id,
    };
  } catch (error) {
    console.error("❌ Error manejando petición MCP:", error);
    
    setResponseStatus(event, 500);
    return {
      jsonrpc: "2.0",
      error: {
        code: -32603,
        message: "Internal server error",
      },
      id: body?.id,
    };
  }
});
