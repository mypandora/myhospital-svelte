import { z } from 'zod/v4';

export const formSchema = z.object({
	email: z.email('请输入正确的邮箱地址'),
	password: z.string().min(6, '密码至少需要6个字符')
});
