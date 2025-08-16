import scan from "./file.js";

console.log(
	scan({
		id: '',
		group: '',
		stamp: '',
		cluster: '',
		filePath: '',
		fileName: '',
		extension: '',
		sourcePath: '',
		targetPath: '',
		metaFront: 'metaFront__',
		content: `
<button
		class="$font-button $bg-primary-500 $text-bright $p-2 $radius-2 $cursor-pointer anim$all custom$button size color icon"
		xcss-color='primary'
		custom$button="
		display: inline-flex;
			align-items: center;"
		#Ms1="sdf:hgg;"
		$="asd
			asdd"
>
		`,
		midway: "",
		manifest: {
			file: {
				group: '',
				id: ''
			},
			global: {},
			local: {}
		},
		styleData: {
			usedIndexes: new Set(),
			essentials: [],
			styleGlobals: {},
			styleLocals: {},
			styleMap: {},
			classGroups: [],
			postBinds: [],
			preBinds: [],
			errors: [],
			hasMainTag: false,
			hasStyleTag: false,
			hasAttachTag: false,
			hasStencilTag: false,
		}
	}, ["class"], 'read'
	),
);


// console.log(
// 	scan(`<button
//                 class="$font-button $bg-primary-500 $text-bright $p-2 $radius-2 $cursor-pointer anim$all custom$button size color icon"
//                 xcss-color='primary' 
//                 custom$button="
//                 	display: inline-flex;
//                		align-items: center;"
//                 #Ms1="sdf:hgg;"
//                 $="asd
//                 asdd"
//   >`,
// 	"split",
// 	["class"],
// 	{})
// )