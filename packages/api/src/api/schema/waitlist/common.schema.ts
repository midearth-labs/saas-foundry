import { z } from 'zod';
import { UUID } from '../common';

// Take note that multiselect's eventual CONCRETE values
// would be contained in an array, and ultimately parsed
// and stored in the db as a JSON array
// export const waitlistFieldTypeSchema = z
// .enum(['TEXT', 'SELECT', 'MULTISELECT', 'REASON', 'COMPANY_NAME'])
// .default('TEXT');

export const definitionId = UUID;
