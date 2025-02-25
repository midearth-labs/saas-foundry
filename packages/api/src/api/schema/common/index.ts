import { z } from 'zod';

// UUID ID
export const UUID = z
.string()
.min(36)
.min(36)
.uuid();

// String with a minimum length of 1
export const StringID = z.string().min(1);
// Integer ID with a value greater than 0
export const NumericID = z.number().int().positive();


export const UUIDInputSchema = z.object({
    id: UUID
});

export const NumericIdInputSchema = z.object({
    id: NumericID
});

export const StringIdInputSchema = z.object({
    id: StringID
});

export const UUIDOutputSchema = UUIDInputSchema;
export const NumericIdOutputSchema = NumericIdInputSchema;
export const StringIdOutputSchema = StringIdInputSchema;

export const VoidInputSchema = z.void();
export const VoidOutputSchema = VoidInputSchema;

export const Email = z
.string()
.max(256)
.email("Invalid email format")
.transform((str) => str.toLowerCase());
