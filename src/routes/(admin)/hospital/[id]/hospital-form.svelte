<script>
	import { goto } from '$app/navigation';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { formSchema } from './schema';

	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';

	/**
	 * @type {import('sveltekit-superforms').SuperValidated<import('sveltekit-superforms').Infer<import('./schema').FormSchema>>} data
	 */
	let { data } = $props();

	const form = superForm(data, {
		resetForm: false,
		validators: zodClient(formSchema),
		onUpdated() {
			// Fix for resetting the form when creating a user.
			if (!data.data.id) {
				form.reset({ keepMessage: true });
			}
		}
	});

	const { form: formData, errors, enhance } = form;
</script>

<form use:enhance method="post" class="space-y-2" action="?/update">
	<input type="hidden" name="id" bind:value={$formData.id} />

	<Form.Field {form} name="name" class="space-y-2">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="text-sm">医院名称</Form.Label>
				<Input class="" {...props} type="text" bind:value={$formData.name} required />
				<Form.FieldErrors class="h-5" errorClasses="">{$errors.name}</Form.FieldErrors>
			{/snippet}
		</Form.Control>
	</Form.Field>
	<Form.Field {form} name="institutionCode" class="space-y-2">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="text-sm">医院编码</Form.Label>
				<Input class="" {...props} type="text" bind:value={$formData.institutionCode} required />
				<Form.FieldErrors class="h-5" errorClasses="">{$errors.institutionCode}</Form.FieldErrors>
			{/snippet}
		</Form.Control>
	</Form.Field>
	<Form.Field {form} name="levelName" class="space-y-2">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="text-sm">医院等级</Form.Label>
				<Input class="" {...props} type="text" bind:value={$formData.levelName} required />
				<Form.FieldErrors class="h-5" errorClasses="">{$errors.levelName}</Form.FieldErrors>
			{/snippet}
		</Form.Control>
	</Form.Field>
	<Form.Field {form} name="typeName" class="space-y-2">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="text-sm">医院类型</Form.Label>
				<Input class="" {...props} type="text" bind:value={$formData.typeName} required />
				<Form.FieldErrors class="h-5" errorClasses="">{$errors.typeName}</Form.FieldErrors>
			{/snippet}
		</Form.Control>
	</Form.Field>
	<Form.Field {form} name="district" class="space-y-2">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="text-sm">所属区</Form.Label>
				<Input class="" {...props} type="text" bind:value={$formData.district} />
				<Form.FieldErrors class="h-5" errorClasses="">{$errors.district}</Form.FieldErrors>
			{/snippet}
		</Form.Control>
	</Form.Field>
	<Form.Field {form} name="address" class="space-y-2">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="text-sm">单位地址</Form.Label>
				<Input class="" {...props} type="text" bind:value={$formData.address} />
				<Form.FieldErrors class="h-5" errorClasses="">{$errors.address}</Form.FieldErrors>
			{/snippet}
		</Form.Control>
	</Form.Field>
	<Form.Field {form} name="zipCode" class="space-y-2">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="text-sm">邮编</Form.Label>
				<Input class="" {...props} type="text" bind:value={$formData.zipCode} />
				<Form.FieldErrors class="h-5" errorClasses="">{$errors.zipCode}</Form.FieldErrors>
			{/snippet}
		</Form.Control>
	</Form.Field>
	<Form.Field {form} name="introduction" class="space-y-2">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="text-sm">医院简介</Form.Label>
				<Input class="" {...props} type="email" bind:value={$formData.introduction} />
				<Form.FieldErrors class="h-5" errorClasses="">{$errors.introduction}</Form.FieldErrors>
			{/snippet}
		</Form.Control>
	</Form.Field>

	<div class="flex justify-center gap-6">
		<Form.Button type="button" color="purpleToBlue" class="" onclick={() => goto('/hospital')}
			>取消</Form.Button
		>
		<Form.Button type="submit" color="purpleToBlue" class="">保存</Form.Button>
	</div>
</form>
