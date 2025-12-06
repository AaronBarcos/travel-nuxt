import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { randomUUID } from 'node:crypto';
import { 
  searchFlightsToolName, 
  searchFlightsToolDescription, 
  searchFlightsToolInputSchema, 
  searchFlightsHandler 
} from './tools/searchFlights';
import { 
  searchAccommodationToolName, 
  searchAccommodationToolDescription, 
  searchAccommodationToolInputSchema, 
  searchAccommodationHandler 
} from './tools/searchAccommodation';

// Mapa de transports por sesión
const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

// Servidor MCP singleton
let mcpServer: McpServer | null = null;

export function getMcpServer(): McpServer {
  if (!mcpServer) {
    mcpServer = new McpServer({
      name: 'travel-planner-server',
      version: '1.0.0'
    });

    mcpServer.registerTool(
      searchFlightsToolName,
      {
        title: 'Search Flights',
        description: searchFlightsToolDescription,
        inputSchema: searchFlightsToolInputSchema
      },
      searchFlightsHandler
    );

    mcpServer.registerTool(
      searchAccommodationToolName,
      {
        title: 'Search Accommodations',
        description: searchAccommodationToolDescription,
        inputSchema: searchAccommodationToolInputSchema
      },
      searchAccommodationHandler
    );
  }
  return mcpServer;
}

export function getTransports() {
  return transports;
}

export function createTransport(server: McpServer): StreamableHTTPServerTransport {
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
    onsessioninitialized: (sessionId) => {
      transports[sessionId] = transport;
    },
  });
  
  transport.onclose = () => {
    if (transport.sessionId) {
      delete transports[transport.sessionId];
    }
  };

  return transport;
}

