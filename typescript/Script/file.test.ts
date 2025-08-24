import scan from "./file.js";

const test = (content: string) => console.log(
	scan({
		id: '',
		group: '',
		xcssclassFront: '',
		cluster: '',
		filePath: '',
		packageName: '',
		extension: '',
		sourcePath: '',
		targetPath: '',
		metaclassFront: 'metaFront__',
		content: content,
		midway: "",
		manifest: {
			refer: {
				group: '',
				id: ''
			},
			global: {},
			local: {}
		},
		styleData: {
			usedIndexes: new Set(),
			styleGlobals: {},
			styleLocals: {},
			styleMap: {},
			classGroups: [],
			attachments: [],
			errors: [],
			hasMainTag: false,
			hasStyleTag: false,
			hasAttachTag: false,
			hasStencilTag: false,
		}
	},
		["class"],
		'read',
		new Set<string>(),
		{ Portable: {}, Library: {}, Native: {}, Local: {}, Global: {} },
		{}
	),
);

test(`
	hi helllow 
123<button=num
	class="$font-button $bg-primary-500 $text-bright $p-2 $radius-2 $cursor-pointer anim$all custom$button size color icon"
	xcss-color='primary'
	custom$button="
		display: inline-flex;
		align-items: center;"
	#Ms1="sdf:hgg;"
	$="asd:asdd"
123ve
;<xtyle custom$button="
		display: inline-flex;
			align-items: center;"
		class="$font-button $bg-primary-500 $text-bright $p-2 $radius-2 $cursor-pointer anim$all custom$button size color icon"
		xcss-color='primary'
	#Ms1="sdf:hgg;"
		$="asd
			asdd"
>
			h1{}
</xtyle>
`);