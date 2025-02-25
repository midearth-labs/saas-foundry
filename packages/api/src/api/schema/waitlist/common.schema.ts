import { z } from 'zod';

// Take note that multiselect's eventual CONCRETE values
// would be contained in an array, and ultimately parsed
// and stored in the db as a JSON array
export const waitlistFieldTypeSchema = z
.enum(['TEXT', 'SELECT', 'MULTISELECT', 'REASON', 'COMPANY_NAME'])
.default('TEXT');
