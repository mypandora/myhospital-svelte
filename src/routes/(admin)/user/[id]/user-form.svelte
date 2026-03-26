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
	<input type="hidden" name="oldEmail" bind:value={$formData.email} />

	<div class="grid grid-cols-2 gap-6">
		<Form.Field {form} name="firstName" class="space-y-2">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label class="text-sm">名</Form.Label>
					<Input class="" {...props} type="text" bind:value={$formData.firstName} required />
					<Form.FieldErrors class="h-5" errorClasses="">{$errors.firstName}</Form.FieldErrors>
				{/snippet}
			</Form.Control>
		</Form.Field>
		<Form.Field {form} name="lastName" class="space-y-2">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label class="text-sm">姓</Form.Label>
					<Input class="" {...props} type="text" bind:value={$formData.lastName} required />
					<Form.FieldErrors class="h-5" errorClasses="">{$errors.lastName}</Form.FieldErrors>
				{/snippet}
			</Form.Control>
		</Form.Field>
	</div>

	<Form.Field {form} name="email" class="space-y-2">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="text-sm">邮箱</Form.Label>
				<Input class="" {...props} type="email" bind:value={$formData.email} required />
				<Form.FieldErrors class="h-5" errorClasses="">{$errors.email}</Form.FieldErrors>
			{/snippet}
		</Form.Control>
	</Form.Field>

	<div class="flex justify-center gap-6">
		<Form.Button type="button" color="purpleToBlue" class="" onclick={() => goto('/user')}
			>取消</Form.Button
		>
		<Form.Button type="submit" color="purpleToBlue" class="">保存</Form.Button>
	</div>
</form>
