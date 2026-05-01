import { z } from 'zod';

export const formSchema = z.object({
	id: z.string(),
	name: z.string().min(1, { message: '医院名称至少需要1个字符' }),
	institutionCode: z.string().min(1, { message: '医院编码至少需要1个字符' }),
	district: z.string().optional(),
	typeName: z.string().optional(),
	levelName: z.string().optional(),
	address: z.string().max(200, { message: '地址不能超过200个字符' }).optional(),
	zipCode: z.string().nullable().optional(),
	introduction: z.string().optional(),
	lng: z.string().optional(),
	lat: z.string().optional()
});

/**
 * @typedef {typeof formSchema} FormSchema
 */
