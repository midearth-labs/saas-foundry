import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { HotelGuestRepository } from '../interfaces/hotel-guest.repository';
import { hotelGuestTable } from '../../db/schema/hotel-guest.schema';
import { CreateHotelGuestDto, HotelGuestDto, HotelGuestIdDto } from '../../models/hotel-guest.model';

const mapToDto = (data: any): HotelGuestDto => ({
    ...data,
    checkInDate: data.checkInDate ? new Date(data.checkInDate) : undefined,
    checkOutDate: data.checkOutDate ? new Date(data.checkOutDate) : undefined
});

export const createDrizzleHotelGuestRepository = (db: NodePgDatabase<any>): HotelGuestRepository => {
    return {
        async create(data: CreateHotelGuestDto): Promise<HotelGuestIdDto> {
            const id = crypto.randomUUID();
            const now = new Date();
            await db.insert(hotelGuestTable).values({
                id,
                ...data,
                checkInDate: data.checkInDate?.toISOString(),
                checkOutDate: data.checkOutDate?.toISOString(),
                createdAt: now,
                updatedAt: now,
            });
            return { id };
        },

        async findById(data: HotelGuestIdDto): Promise<HotelGuestDto | null> {
            const result = await db
                .select()
                .from(hotelGuestTable)
                .where(eq(hotelGuestTable.id, data.id))
                .limit(1);
            
            return result[0] ? mapToDto(result[0]) : null;
        },

        async findAll(): Promise<HotelGuestDto[]> {
            const results = await db
                .select()
                .from(hotelGuestTable);
            
            return results.map(mapToDto);
        },

        async update(id: HotelGuestIdDto, data: Partial<CreateHotelGuestDto>): Promise<HotelGuestDto> {
            const updated = await db
                .update(hotelGuestTable)
                .set({
                    ...data,
                    checkInDate: data.checkInDate?.toISOString(),
                    checkOutDate: data.checkOutDate?.toISOString(),
                })
                .where(eq(hotelGuestTable.id, id.id))
                .returning();
            
            return mapToDto(updated[0]);
        },

        async delete(id: HotelGuestIdDto): Promise<void> {
            await db
                .delete(hotelGuestTable)
                .where(eq(hotelGuestTable.id, id.id));
        }
    };
}; 