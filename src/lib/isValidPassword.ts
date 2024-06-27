export async function isValidPassword(password: string, hashedPassword: string) {
    console.log(await hashPassword(password))
    return await hashPassword(password) === hashedPassword
}

async function hashPassword(password: string) {
    // we want to encrypt this function to make it impossible to decrypt it - which exactly means what hashing is!
    // digest is a keyword for hash
    const arrayBuffer = await crypto.subtle.digest("SHA-512",
    new TextEncoder().encode(password))

    return Buffer.from(arrayBuffer).toString("base64")
}