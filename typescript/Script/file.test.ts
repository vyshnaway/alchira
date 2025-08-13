import scan from "./file.js";

console.log(
  scan(`
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


console.log(tag(`<button
                class="$font-button $bg-primary-500 $text-bright $p-2 $radius-2 $cursor-pointer anim$all custom$button size color icon"
                xcss-color='primary' 
                custom$button="
                	display: inline-flex;
               		align-items: center;"
                #Ms1="sdf:hgg;"
                $="asd
                asdd"
  >`,
	"split",
	["class"],
	{})
)