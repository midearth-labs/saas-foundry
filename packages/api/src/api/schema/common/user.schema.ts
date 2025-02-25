/**Zod schema for User objects that can be either admins
 * or base users. These are the expected fields:
 * 
 * - role
 * - name
 * - email
 * - password
 * 
 * ID is not included because Prisma autogenerates one for us.
 */
import { z } from 'zod';

export const RoleEnum = z.enum(['ADMIN', 'USER']);

// Basic and honestly toyish/optional definition
export const NameSchema = z
.string()
.min(4)
.optional()
.default("");
export type NameType = z.infer<typeof NameSchema>;

// Id, which is optional
export const IdSchema = z
.string()
.min(16)
.cuid()
.optional();
export type IdType = z.infer<typeof IdSchema>;

// (STRONG) Password definition, pretty effective and time saving
export const PasswordSchema = z
.string()
.min(8, "Password must be at least 8 characters")
.regex(/[A-Z]/, "Must contain at least one uppercase letter")
.regex(/[0-9]/, "Must contain at least one number");
export type PasswordType = z.infer<typeof PasswordSchema>;

export const EmailSchema = z
.string()
.email("Invalid email format")
.transform((str) => str.toLowerCase());
export type EmailType = z.infer<typeof EmailSchema>;

export const UserSchema = z.object({
    id: IdSchema,
    password: PasswordSchema,
    email: EmailSchema,
    role: RoleEnum
});