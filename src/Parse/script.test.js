import scan from "./script.js"

console.log(scan(`
<script>
import Navbar from "$lib/Navbar.svelte";
</script>

<header class="huih">
	<Navbar isConsole="false" />
</header>

<main>
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

`, "svelte", false))
