import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import staticFiles from "@fastify/static";
import prismaPlugin from "./plugins/prisma.js";
import authPlugin from "./plugins/auth.js";
import authRoutes from "./modules/auth/auth.routes.js";
import notesRoutes from "./modules/notes/notes.routes.js";
import foldersRoutes from "./modules/folders/folders.routes.js";
import attachmentsRoutes from "./modules/attachments/attachments.routes.js";
import { UPLOADS_DIR } from "./config/env.js";

export async function buildApp() {
  const app = Fastify({
    logger: {
      transport: {
        target: "pino-pretty",
        options: { colorize: true },
      },
    },
  });

  // CORS
  await app.register(cors, {
    origin: ['http://localhost:5173', 'http://localhost:4173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // File upload support
  await app.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
  });

  // Static files (uploads)
  await app.register(staticFiles, {
    root: UPLOADS_DIR,
    prefix: '/uploads/',
  });

  // Plugins
  await app.register(prismaPlugin);
  await app.register(authPlugin);

  // Routes
  await app.register(authRoutes, { prefix: "/api/auth" });
  await app.register(notesRoutes, { prefix: "/api/notes" });
  await app.register(foldersRoutes, { prefix: "/api/folders" });
  await app.register(attachmentsRoutes, { prefix: "/api/notes" });

  // Health check
  app.get("/api/health", async () => {
    return { status: "ok", timestamp: new Date().toISOString() };
  });

  // Global error handler
  app.setErrorHandler(
    (error: Error & { statusCode?: number }, _request, reply) => {
      const statusCode = error.statusCode || 500;
      const message = error.message || "Internal Server Error";

      app.log.error(error);

      reply.status(statusCode).send({
        error: message,
        statusCode,
      });
    },
  );

  return app;
}
