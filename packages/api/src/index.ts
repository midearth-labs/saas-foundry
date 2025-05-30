import fastify from 'fastify';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { getAppRouter } from './trpc/root';
import { getContextCreator } from './trpc/context';
import { HttpHeader } from 'fastify/types/utils';
import path from 'path';
import * as dotenv from 'dotenv';
import { createAppContext } from './app-context';

dotenv.config({
    path: path.resolve(process.cwd(), '.env')
});

export async function startServer() {

    const appContext = createAppContext();

    // Initialize Fastify server instance with Pino logger
    const server = fastify({
        logger: {
            level: "info",
            transport: {
                target: "pino-pretty",
                options: {
                    translateTime: "HH:MM:ss Z",
                    ignore: "pid, hostname",
                },
            }
        },
        trustProxy: true,
        maxParamLength: 5000,
    });

    try {
        // CORS plugin and types registration
        await server.register(import('@fastify/cors'), {
            origin: (origin, cb) => {
                const allowedOrigins = [process.env.API_ORIGIN ?? "http://localhost:3005"]; // or ["http://localhost:3000"];
                cb(null, allowedOrigins.includes(origin??''));
            },
            credentials: true,
        })

        // tRPC binding
        await server.register(fastifyTRPCPlugin, {
            prefix: '/api/trpc',    // perhaps /trpc/v1, just like /api/v1/
            trpcOptions: {
                router: getAppRouter(),
                createContext: getContextCreator(appContext),  // <- TRPC CONTEXT IS BOUND WITH FASTIFY SERVER HERE
            },
        });

        server.get('/health', async () => ({ status: 'ok' }));

        // server.decorate("auth", auth);
        // https://www.better-auth.com/docs/installation#mount-handler
        // Bug fix due to suspected fastify / better-auth race condition in consuming the request body
        // https://github.com/better-auth/better-auth/issues/599#issuecomment-2557799177
        // This causes the requests to hang ~indefinitely / time-out
        await server.register(async (server) => {
            const authhandler = await appContext.authEngine.getAuthHandler();
          
            server.addContentTypeParser(
              "application/json",
              (_request, _payload, done) => {
                done(null, null);
              },
            );
          
            server.all("/api/auth/*", async (request, reply) => {
                // Copy back the headers to the raw reply object
                reply.raw.setHeaders(headersRecordToMap(reply.getHeaders()));

                await authhandler(request.raw, reply.raw);
            });
        });
        
        // Dynamically import test endpoints if we're in a test/development environment
        const NODE_ENV = process.env.NODE_ENV || 'TEST';
        if (NODE_ENV === 'TEST' || NODE_ENV === 'PROD') {
            try {
                const { registerTestEndpoints } = await import('./test.endpoints');
                registerTestEndpoints(server);
            } catch (error) {
                console.error('Failed to load test endpoints:', error);
            }
        }

        const address = await server.listen({
            port: parseInt(process.env.API_PORT ?? '3005'), // 3000 for development, 3333 for test,
            host: process.env.API_HOST ?? 'localhost', // '127.0.0.1'
        });
        console.log(`Server listening at ${address}`);
        // displayBanner();

        return server;

    } catch(error) {
        console.error('Server start failed:', error);
        await server.close();
        throw error;
    }
}

export const headersRecordToMap = (
    headers: Record<HttpHeader, string | number | string[] | undefined>
) => {
    const entries = Object.entries(headers);
    const map: Map<string, number | string | readonly string[]> = new Map();
    for (const [headerKey, headerValue] of entries) {
        if (headerValue != null) {
            map.set(headerKey, headerValue);
        }
    }
    return map;
};

startServer()
    .then(() => {
    console.log('Server started directly');
    })
    .catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
    });