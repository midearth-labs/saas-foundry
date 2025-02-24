import { z } from 'zod';
import { getDefinitionOutputSchema } from "./getDefinition.schema";

export const getAllDefinitionsOutputSchema = z.array(getDefinitionOutputSchema);
