import fastify from 'fastify';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { getAppRouter } from './trpc/root';
import { getContextCreator } from './trpc/context';
import { auth } from './auth';
import { toNodeHandler } from 'better-auth/node';
import { HttpHeader } from 'fastify/types/utils';

export async function startServer() {

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
                const allowedOrigins = ["http://localhost:3005"]; // or ["http://localhost:3000"];
                cb(null, allowedOrigins.includes(origin??''));
            },
            credentials: true,
        })

        // tRPC binding
        await server.register(fastifyTRPCPlugin, {
            prefix: '/api/trpc',    // perhaps /trpc/v1, just like /api/v1/
            trpcOptions: {
                router: getAppRouter(),
                createContext: getContextCreator(),  // <- TRPC CONTEXT IS BOUND WITH FASTIFY SERVER HERE
            },
        });

        server.get('/health', async () => ({ status: 'ok' }));

        // server.decorate("auth", auth);
        // https://www.better-auth.com/docs/installation#mount-handler
        // Bug fix due to suspected fastify / better-auth race condition in consuming the request body
        // https://github.com/better-auth/better-auth/issues/599#issuecomment-2557799177
        // This causes the requests to hang ~indefinitely / time-out
        await server.register((server) => {
            const authhandler = toNodeHandler(auth);
          
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

        const address = await server.listen({
            port: 3005, // 3000 for development, 3333 for test,
            host: 'localhost', // '127.0.0.1'
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