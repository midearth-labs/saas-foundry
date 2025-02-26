# SAASFoundry

Open-source framework for building production-ready SAAS+AI applications.

## Project Structure
- `packages/`: Core framework packages
- `apps/`: Example applications
- `examples/`: Usage examples

## Development
- Run commands with Turborepo:
   - `pnpm run build`: Build all apps and packages
   - `pnpm run dev`: Develop all apps and packages
   - `pnpm run lint`: Lint all apps and packages
   - `pnpm run test`: Test all apps and packages
- Run a command twice to hit cache

## Database
Run `docker run --name saasfoundry -e POSTGRES_PASSWORD=saasfoundry -p 5432:5432 postgres` in a separate terminal to start the database.

- Run commands in the `packages/api` directory:
   - `pnpm run db:generate`: Generate the database schema
   - `pnpm run db:migrate`: Migrate the database
   - `pnpm run db:studio`: Studio the database

## API Server
In the `packages/api` directory, run `pnpm run dev` to start the API server. The db (docker run) needs to be running first.
- Run `pnpm run dev-client` to start the client and execute some commands against the API.

## Contributing
See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License
See [LICENSE.md](./LICENSE.md) for details.