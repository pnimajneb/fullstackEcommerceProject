// let's make sure that eg updating something in the admin panel everything gets updated also on the other pages. Next.js heavily works with caching
// let's create a helper function for that:
import { unstable_cache as nextCache } from "next/cache";
import { cache as reactCache } from "react";
// --> two different levels of caching: the first one is for data caching in next.js and the second one for request memorization
// https://blog.webdevsimplified.com/2024-01/next-js-app-router-cache/

type Callback = (...args: any[]) => Promise<any>

export default function cache<T extends Callback>(
    cb: T,
    keyParts: string[],
    options: { revalidate?: number | false; tags?: string[]} = {}
) {
    return nextCache(reactCache(cb), keyParts, options)
}