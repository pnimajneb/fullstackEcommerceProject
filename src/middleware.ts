import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
    //check if the user is on an admin page
    if(await isAuthenticated(req) === false) {
        return new NextResponse("Unauthorized", {status: 401,
            // with headers we can specify a specific type of authorization - Basic authentication which is build into the browser
            headers: { "WWW-Authenticate" : "Basic" }})
    }
}

async function isAuthenticated(req: NextRequest) {
    // let's check how the user can authenticate him/herself:
    const authHeader = req.headers.get("authorization") || req.headers.get("authorization") 

    if(authHeader === null) return false

    // with Buffer we can decrypt the values of username & password
    // from there we change it to "base64" --> convert the values down to a Buffer based on base64
    // by using the property [1] we get the second part of the string because the first part is always going to be Basic and we need what comes afterwards, eg "Basic wdnewfsfo" or in a specific case it would be "Basic username:password"
    // eventually the decoded value will look something like: username:password
    const [username, password] = Buffer.from(authHeader.split(" ")[1], "base64").toString().split(":")
    
    // let's return a check
    return username === process.env.ADMIN_USERNAME && (await isValidPassword(password, process.env.HASHED_ADMIN_PASSWORD as string))
}

export const config = {
    // this is going to run whenever someone tries to enter an admin area
    matcher: "/admin/:path*"
}