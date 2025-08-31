// import * as _Config from "../type/config.js";
// import * as _File from "../type/file.js";
import * as _Style from "../type/style.js";
// import * as _Script from "../type/script.js";
// import * as _Cache from "../type/cache.js";
// import * as _Support from "../type/support.js";

import krypt from "./kryptic.js";
import * as CACHE from "../data/cache.js";
import previewOrganize from "./organize.js";


CACHE.ROOT.URL["Worker"] = "https://workers.xpktr.com/api/xcss-build-request";
// APP.URL["Worker"] = APP.Worker + "api/publish";

export default async function order(
	sequences: number[][],
	command: "preview" | "publish",
	argument = "",
	artifact = {
		name: '',
		version: '',
		content: ''
	}
): Promise<{
	status: boolean;
	message: string;
	result: _Style.SortedOutput;
}> {
	const RESPONSE = {
		status: command === "preview",
		message: "Preview Build",
		result: previewOrganize(sequences),
	};

	if (command === "publish") {

		if (argument.length < 25) {
			RESPONSE.message = "Invalid Key. Fallback: preview";
			return RESPONSE;
		}


		const projectId = argument.slice(0, 24);
		const publicKey = argument.slice(25);
		const contentCrypt = await krypt.sym.gencrypt(JSON.stringify(RESPONSE.result.shortlistedArrays));

		let asymEncrypted;

		try {
			asymEncrypted = await krypt.asym.encrypt(
				projectId + contentCrypt.iv + contentCrypt.key,
				publicKey,
			);
		} catch {
			RESPONSE.message = "Invalid Key. Fallback: preview";
			return RESPONSE;
		}


		const myHeaders = new Headers();
		myHeaders.append("Content-Type", "application/json");
		const data = JSON.stringify({
			access: publicKey,
			private: asymEncrypted,
			content: contentCrypt.data,
			artifact
		});

		const requestOptions: RequestInit = {
			method: "POST",
			headers: myHeaders,
			body: data,
			redirect: "follow",
		};

		fetch(CACHE.ROOT.URL["Worker"], requestOptions)
			.then((res) => res.json())
			.then(async (res) => {
				RESPONSE.status = res.status;

				if (res.status) {
					RESPONSE.message = res.message;
					RESPONSE.result = JSON.parse(await krypt.sym.decrypt(res.result, contentCrypt.key, contentCrypt.iv,));
				} else {
					RESPONSE.message = res.message ?? "Failed to establish connection with server. Fallback: preview";
				}
			});
	}

	return RESPONSE;
}