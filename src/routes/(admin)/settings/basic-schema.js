import { z } from 'zod';

export const formSchema = z.object({
	firstName: z.string().min(2, { message: '名字至少需要2个字符' }),
	lastName: z.string().min(2, { message: '名字至少需要2个字符' }),
	email: z.string().email({ message: '请输入有效的电子邮件地址' })
});
