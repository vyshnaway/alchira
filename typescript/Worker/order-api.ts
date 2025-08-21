import krypt from "./kryptic.js";
import { APP } from "../Data/cache.js";
import previewOrganize from "./organize.js";
import { t_OrganizedResultDictionary } from "../types.js";


APP.URL["Worker"] = "https://workers.xpktr.com/api/xcss-build-request";
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
) {
	const previewResult = previewOrganize(sequences);

	if (CMD === "publish") {
		if (KEY.length < 25) {
			return {
				status: false,
				message: "Invalid Key. Fallback: preview",
				result: previewResult
			};
		}

		const projectId = KEY.slice(0, 24);
		const publicKey = KEY.slice(25);
		const contentCrypt = await krypt.sym.gencrypt(JSON.stringify(previewResult.shortlistedArrays));

		let asymEncrypted;
		try {
			asymEncrypted = await krypt.asym.encrypt(
				projectId + contentCrypt.iv + contentCrypt.key,
				publicKey,
			);
		} catch {
			return {
				status: false,
				message: "Invalid Key. Fallback: preview",
				result: previewResult
			};
		}

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

		const myHeaders = new Headers();
		myHeaders.append("Content-Type", "application/json");
		const requestOptions: RequestInit = {
			method: "POST",
			headers: myHeaders,
			body: data,
			redirect: "follow",
		};

		return fetch(APP.URL["Worfer"], requestOptions)
			.then((response) => response.json())
			.then(async (response) => {
				if (response.status) {
					return {
						status: true,
						message: response.message,
						result: JSON.parse(
							await krypt.sym.decrypt(
								response.result,
								contentCrypt.key,
								contentCrypt.iv,
							),
						) as t_OrganizedResultDictionary,
					};
				} else {
					return {
						status: false,
						message: response.message ?? "Failed to establish connection with server. Fallback: preview",
						result: previewResult
					};
				}
			});
	} else {
		return Promise.resolve({
			status: true,
			message: "Preview Build",
			result: previewResult
		});
	}
}
