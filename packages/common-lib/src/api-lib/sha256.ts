export const sha256 = async (message: string) => {
    // Encode the message as a Uint8Array
    const textEncoder = new TextEncoder();
    const data = textEncoder.encode(message);

    // Calculate the SHA-256 hash
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);

    // Convert the hash to a base64 string
    const hashArray = new Uint8Array(hashBuffer);
    const base64Hash = btoa(String.fromCharCode(...hashArray));

    return base64Hash;
};
