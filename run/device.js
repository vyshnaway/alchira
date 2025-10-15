function getDeviceInfo() {
    const platform = navigator.platform;
    const userAgent = navigator.userAgent;

    let os = "Unknown OS";
    if (platform.startsWith("Win")) os = "Windows";
    else if (platform.startsWith("Mac")) os = "MacOS";
    else if (platform.startsWith("Linux")) os = "Linux";
    else if (/Android/.test(userAgent)) os = "Android";
    else if (/iPhone|iPad|iPod/.test(userAgent)) os = "iOS";

    // Architecture guess (very rough, relies on userAgent)
    let arch = "Unknown Arch";
    if (/arm|aarch64/i.test(userAgent)) arch = "ARM";
    else if (/x86_64|Win64|WOW64|amd64/i.test(userAgent)) arch = "x64";
    else if (/i[3-6]86|x86/i.test(userAgent)) arch = "x86";

    return { os, arch, platform, userAgent };
}

console.log(getDeviceInfo());
