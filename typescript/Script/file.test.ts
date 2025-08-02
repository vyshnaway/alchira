import scan from "./file.js";

console.log(
  scan(
    `
<script>
import Navbar from "$lib/Navbar.svelte";
</script>

<header class="huih">
	<Navbar isConsole="false" />
</header>

<main $sok="displey: flex" media@norm={} #forge="" $:80="abc" >
	<slot />
</main>

<style>
	header {
		background: #f4f4f4;
		padding: 1rem;
	}

	main {
		padding: 2rem;
	}
</style>

`,
    "svelte",
    false,
  ),
);
