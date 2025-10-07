import * as z from 'zod';

export const createDownloadSchema = z.object({
    title: z.string().min(3).max(100),
    description: z.string().min(10).max(1000),
    file: z.instanceof(File)
});

export interface CreateDownloadInput extends z.TypeOf<typeof createDownloadSchema> { }