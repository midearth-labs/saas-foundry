import fastify from 'fastify';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { getAppRouter } from './trpc/root';
import { getContextCreator } from './trpc/context';

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

startServer()
    .then(() => {
    console.log('Server started directly');
    })
    .catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
    });