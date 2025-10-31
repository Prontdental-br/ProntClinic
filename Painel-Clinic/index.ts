import { createServer } from "http";
import { parse } from "url";

import next from "next";
import { Server } from "socket.io";

import { initDB, seed } from "./src/app/api/db/models";

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";

async function bootstrap() {
  try {
    await initDB();
    await seed();

    console.log("Connection has been established successfully.");
  } catch (err) {
    console.error("Unable to connect to the database:", err);
  }

  const app = next({ dev });
  const handle = app.getRequestHandler();

  app.prepare().then(() => {
    const httpServer = createServer((req, res) => {
      // Configurar CORS manualmente
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        
return;
      }

      const parsedUrl = parse(req.url!, true);

      handle(req, res, parsedUrl);
    });

    const io = new Server(httpServer, {
      cors: {
        origin: '*',
        methods: ["GET", "POST"]
      },
      addTrailingSlash: false,
    });

    io.engine.on("initial_headers", (headers, req) => {
      headers["Access-Control-Allow-Origin"] = "*";
    });
    
    io.engine.on("headers", (headers, req) => {
      headers["Access-Control-Allow-Origin"] = "*";
    });


    io.on("connection", (socket) => {
      console.log("connected", socket.handshake.query.userId);

      io.sockets.emit('new_user', socket.handshake.query.userId);

      socket.once("disconnect", () => {
        console.log("disconnected", socket.handshake.query.userId);
        io.sockets.emit('dis_user', socket.handshake.query.userId);
      });

    });
    

    httpServer.listen(port, () => {
      console.log(
        `> Server listening at http://localhost:${port} as ${
          dev ? "development" : process.env.NODE_ENV
        }`
      );
    });
  });
}

bootstrap();
