<script>
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { formSchema } from './schema.js';

	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Label } from '$lib/components/ui/label/index.js';

	/**
	 * @type {import('sveltekit-superforms').SuperValidated<import('sveltekit-superforms').Infer<import('./schema.js').FormSchema>>} data
	 */
	let { data } = $props();

	const form = superForm(data, {
		validators: zodClient(formSchema)
	});

	const { form: formData, enhance } = form;
</script>

<form use:enhance method="post" class="space-y-2">
	<Form.Field {form} name="email" class="space-y-2">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="text-sm">邮箱</Form.Label>
				<Input {...props} type="email" bind:value={$formData.email} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors class="h-5" errorClasses="animate-bounce" />
	</Form.Field>
	<Form.Field {form} name="password" class="space-y-2">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="text-sm">密码</Form.Label>
				<Input {...props} type="password" bind:value={$formData.password} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors class="h-5" errorClasses="animate-bounce" />
	</Form.Field>

	<Form.Button class="w-full">登录</Form.Button>

	<div class="flex items-center justify-between">
		<Checkbox id="remember-me" class="mr-2" />
		<Label id="terms-label" for="remember-me" class="text-sm leading-none font-medium">
			记住我
		</Label>
		<a href="/forgot" class="ml-auto text-sm font-medium hover:underline">忘记密码</a>
	</div>

	<p class="text-md text-center">
		<span>没有账号？</span>
		<a href="/register" class="font-medium hover:underline">注册</a>
	</p>
</form>
