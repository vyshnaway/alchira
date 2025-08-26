import krypt from "./kryptic.js";
import { ROOT } from "../Data/cache.js";
import previewOrganize from "./organize.js";
import { t_OrganizedResult } from "../types.js";


ROOT.URL["Worker"] = "https://workers.xpktr.com/api/xcss-build-request";
// APP.URL["Worker"] = APP.Worker + "api/publish";

export default async function order(
	sequences: number[][],
	CMD: "preview" | "publish",
	KEY = "",
	portable = {
		name: '',
		version: '',
		jsonContent: ''
	}
): Promise<{
	status: boolean;
	message: string;
	result: t_OrganizedResult;
}> {
	const RESPONSE = {
		status: CMD === "preview",
		message: "Preview Build",
		result: previewOrganize(sequences),
	};

	if (CMD === "publish") {

		if (KEY.length < 25) {
			RESPONSE.message = "Invalid Key. Fallback: preview";
			return RESPONSE;
		}


		const projectId = KEY.slice(0, 24);
		const publicKey = KEY.slice(25);
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
			portable: {
				name: portable.name,
				version: portable.version,
				content: portable.jsonContent,
			}
		});

		const requestOptions: RequestInit = {
			method: "POST",
			headers: myHeaders,
			body: data,
			redirect: "follow",
		};

		fetch(ROOT.URL["Worker"], requestOptions)
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