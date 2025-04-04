const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

export default async function buildAPI(sequences, key) {
    const raw = JSON.stringify({
        accessKey: key || "",
        encryptedProjectId: "",
        sequences: sequences
    });

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };

    try {
        const response = await fetch("https://workers.xpktr.com/api/xcss-build-request?", requestOptions);
        const result = await response.text();
        console.log(result);
        return result;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}
