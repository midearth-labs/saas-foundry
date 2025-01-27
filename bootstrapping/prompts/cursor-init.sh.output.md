# Initial setup
mkdir saas-foundry && cd saas-foundry
git init
pnpm init

# Create directory structure
mkdir -p packages/{trpc,api-server,jobs,shared/{backend,frontend},ui/{kits,user-frontend,admin-frontend},cli} apps/{website,docs} examples

# Create initial config files
touch turbo.json tsconfig.json .eslintrc.js .prettierrc .gitignore

# Add dependencies
pnpm add -D typescript @types/node turbo @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint prettier jest @types/jest ts-jest

# Add core packages
pnpm add -D @trpc/server @trpc/client zod superjson express @prisma/client prisma

# Initialize TypeScript
pnpm tsc --init

# Create placeholder READMEs
find . -type d -not -path "./node_modules/*" -not -path "./.git/*" -exec touch {}/README.md \;