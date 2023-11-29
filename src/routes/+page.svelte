<script lang="ts">
	import { alertUtility, confirmUtility } from '$lib';
	import { onMount } from 'svelte';

  export let data;
  export let form;

  onMount(() => {
    if (form?.message) {
      alertUtility(form.message);
    }
  });

  let deleteButton: HTMLButtonElement;
  let ip = '';
</script>
<h1 class="text-2xl text-center mt-4">🔐 Авторизовані сесії</h1>
<blockquote class="mb-4 text-center text-tg-hint-color">{data.nickname ?? 'Псевдонім не прив\'язано'}</blockquote>
{#if data.nickname}
<form method="post" action="?/delete" class="hidden">
  <input type="text" name="ip" value={ip} required>
  <button class="hidden" bind:this={deleteButton} />
</form>
<form method="post" action="?/add" class="px-4 mb-4">
  <fieldset class="grid grid-cols-2 mb-2 items-center">
    <label for="ip">🌐 IP Адреса</label>
    <input id="ip" type="text" name="ip" placeholder="IP Адреса" value={data.ip} required>
  </fieldset>
  <button class="w-full">Додати</button>
</form>
<div class="px-4 mb-4">
  {#if data.session.length === 0}
  <blockquote class="mb-4 text-center text-tg-hint-color">Не знайдено активних сеансів</blockquote>
  {:else}
  {#each data.session as ipa}
  <div class="p-2 bg-tg-secondary-bg-color rounded grid grid-cols-2 mb-2 items-center">
    <span class="">{ipa}</span>
    <button on:click={() => {
      ip = ipa;
      confirmUtility(`❓ Дійсно видалити ip ${ipa}?`, (yes) => {
        if (yes) {
          deleteButton.click();
        }
      });
    }} class="rounded bg-red-400 p-2">видалити</button>
  </div>
  {/each}
  {/if}
</div>
{/if}
