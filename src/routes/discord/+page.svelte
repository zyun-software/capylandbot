<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';

  let error = false;
	let message = '⏳ Отримання псевдоніма...';
	let hash = '';
	let processButton: HTMLButtonElement;

	onMount(() => {
		hash = location.hash;
		setTimeout(() => processButton.click(), 10);
	});

  const setData = (data: any) => {
    error = !data.success;
    message = data.message;
  }
</script>

<div class="h-screen flex justify-center flex-col px-4">
	<div class="text-center text-2xl{error ? ' text-red-500' : ''}">
		{message}
	</div>
	<form
		method="post"
		class="hidden"
		use:enhance={() =>
			async ({ result, update }) => {
				if (result.status === 200 && result.type === 'success') {
          setData(result.data);
				}

				update();
			}}
	>
		<input type="hidden" name="hash" value={hash} />
		<button bind:this={processButton} />
	</form>
</div>
