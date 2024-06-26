import db from "@/db/db";
import { notFound } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises"

export async function GET(req: NextRequest, {params: {id}} : {params: {id: string}}) {
    const product = await db.product.findUnique({where: {id}, select: {filePath: true, name: true},
    })

    if(product == null) return notFound()
    
    // this gives us the stats of the file that we want to download
    const { size } = await fs.stat(product.filePath)
    const file = await fs.readFile(product.filePath)
    //gives me the file extension at the very end of the file - e.g. it would give me mp4 or pdf
    const extension = product.filePath.split(".").pop()

    //now, i can use the information above to return a download link
    return new NextResponse(file, { headers: {
        "Content-Disposition" : `attachment; filename="${product.name}.${extension}"`,
        "Content-Length" : size.toString(),
    }})
}