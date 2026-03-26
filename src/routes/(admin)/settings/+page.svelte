<script>
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import BasicForm from './basic-form.svelte';
	import PasswordForm from './password-form.svelte';

	/** @type {{data: import('./$types').PageData}} */
	let { data } = $props();
</script>

<svelte:head>
	<title>设置</title>
</svelte:head>

<div class="flex gap-6">
	<Card.Root class="basis-1/4">
		<Card.Content>
			<ul class="flex flex-col bg-transparent p-4 text-neutral-800 opacity-100 shadow-none">
				<li class="bg-transparent pt-0 text-neutral-800 opacity-100 shadow-none">
					<a href="#/">
						<div class="mr-3 bg-transparent leading-none text-neutral-800 opacity-100 shadow-none">
							个人简介
						</div>
					</a>
				</li>
				<li class="bg-transparent pt-0 text-neutral-800 opacity-100 shadow-none">
					<a href="#/">
						<div class="mr-3 bg-transparent leading-none text-neutral-800 opacity-100 shadow-none">
							基本信息
						</div>
					</a>
				</li>
				<li class="bg-transparent pt-0 text-neutral-800 opacity-100 shadow-none">
					<a href="#/">
						<div class="mr-3 bg-transparent leading-none text-neutral-800 opacity-100 shadow-none">
							修改密码
						</div>
					</a>
				</li>
				<li class="bg-transparent pt-0 text-neutral-800 opacity-100 shadow-none">
					<a href="#/">
						<div class="mr-3 bg-transparent leading-none text-neutral-800 opacity-100 shadow-none">
							个人简介
						</div>
					</a>
				</li>
				<li class="bg-transparent pt-0 text-neutral-800 opacity-100 shadow-none">
					<a href="#/">
						<div class="mr-3 bg-transparent leading-none text-neutral-800 opacity-100 shadow-none">
							账号
						</div>
					</a>
				</li>
				<li class="bg-transparent pt-0 text-neutral-800 opacity-100 shadow-none">
					<a href="#/">
						<div class="mr-3 bg-transparent leading-none text-neutral-800 opacity-100 shadow-none">
							通知设置
						</div>
					</a>
				</li>
				<li class="bg-transparent pt-0 text-neutral-800 opacity-100 shadow-none">
					<a href="#/">
						<div class="mr-3 bg-transparent leading-none text-neutral-800 opacity-100 shadow-none">
							删除账号
						</div>
					</a>
				</li>
			</ul>
		</Card.Content>
	</Card.Root>

	<div class="basis-3/4 space-y-6">
		<Card.Root class="w-full">
			<Card.Content class="grid gap-4">
				<Avatar.Root>
					<Avatar.Image src="https://github.com/shadcn.png" alt="@shadcn" />
					<Avatar.Fallback>CN</Avatar.Fallback>
				</Avatar.Root>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title>基本信息</Card.Title>
				<Card.Description>Card Description</Card.Description>
			</Card.Header>
			<Card.Content>
				<BasicForm {data} />
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title>修改密码</Card.Title>
				<Card.Description>Card Description</Card.Description>
			</Card.Header>
			<Card.Content>
				<PasswordForm {data} />
			</Card.Content>
		</Card.Root>

		<Card.Root class="w-full">
			<Card.Header>
				<Card.Title>删除账号</Card.Title>
				<Card.Description>Card Description</Card.Description>
			</Card.Header>
			<Card.Content class="grid gap-4">
				<Avatar.Root>
					<Avatar.Image src="https://github.com/shadcn.png" alt="@shadcn" />
					<Avatar.Fallback>CN</Avatar.Fallback>
				</Avatar.Root>
			</Card.Content>
		</Card.Root>
	</div>
</div>
