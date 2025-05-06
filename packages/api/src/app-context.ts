import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { createDBConnection } from "./db";
import { createAuthEngine, AuthEngine } from "./auth";

export interface AppContext {
  coreDB: NodePgDatabase<any>;
  authEngine: AuthEngine;
}

export const createAppContext = (): AppContext => {
  const coreDB = createDBConnection();
  const authEngine = createAuthEngine(coreDB);

  return { 
    coreDB,
    authEngine,
  };
};