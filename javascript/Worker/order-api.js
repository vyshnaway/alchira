import Use from "../Utils/index.js";
import krypt from "./kryptic.js";

const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

const apiUrl= "https://workers.xpktr.com/api/xcss-build-request";
// const apiUrl = "http://localhost:7071/api/xcss-build-request";
export default async function order(sequences = [], CMD = "", KEY = "") {
    if (CMD === "publish") {
        if (KEY.length < 25) {
            return {
                status: false,
                message: "Invalid Key. Fallback: preview",
                result: Use.array.setback(sequences.flat())
            };
        }

        const projectId = KEY.slice(0, 24)
        const publicKey = KEY.slice(25)
        const contentCrypt = await krypt.sym.gencrypt(JSON.stringify(sequences));

        let asymEncrypted;
        try {
            asymEncrypted = await krypt.asym.encrypt(projectId + contentCrypt.iv + contentCrypt.key, publicKey);
        } catch (error) {
            return {
                status: false,
                message: "Invalid Key. Fallback: preview",
                result: Use.array.setback(sequences.flat())
            };
        }

        const data = JSON.stringify({
            access: publicKey,
            private: asymEncrypted,
            content: contentCrypt.data
        });
        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: data,
            redirect: "follow"
        };

        return fetch(apiUrl, requestOptions)
            .then((response) => response.json())
            .then(async (response) => {
                if (response.status) {
                    return {
                        status: true,
                        message: response.message,
                        result: JSON.parse(await krypt.sym.decrypt(response.result, contentCrypt.key, contentCrypt.iv))
                    }
                } else {
                    return {
                        status: false,
                        message: response.message ?? "Failed to establish connection with server. Fallback: preview",
                        result: Use.array.setback(sequences.flat())
                    }
                }
            })
    } else {
        return Promise.resolve({
            status: true,
            message: "Preview Build",
            result: Use.array.setback(sequences.flat())
        });
    }
}