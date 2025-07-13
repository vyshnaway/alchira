import tag from "./tag.js";

// console.log(tag(`<
//     /h1
//     className={new.add("asd ghj"),"lo78p"}
//     $heading="ert fgh; display: flex"
//     media@(max-width=90px)={color: red} d
//     key="value" hjk/>
//     `, 0, true, "className"))

// console.log(
//   tag(
//     `</h1>
// `,
//     0,
//     true,
//     "className",
//   ),
// );

// console.log(
//   tag(
//     `<h1 $>
// `,
//     0,
//     true,
//     "className",
//   ),
// );

// console.log(
//   tag(
//     `</h1 df$h={f} >
// `,
//     0,
//     true,
//     "className",
//   ),
// );

// console.log(
//   tag(
//     `<$>
// `,
//     0,
//     true,
//     "className",
//   ),
// );

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