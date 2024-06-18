"use server"
// this file refers to the form in the ProductForm.tsx for which we need actions. in the _actions folder we insert different .ts files that point to different components

import db from "@/db/db"
import { z } from "zod"
import fs from "fs/promises"
import { notFound, redirect } from "next/navigation"

//in zod schema there is not a handy way such as .file which is why we need to create our own schema:
// we need to choose File because the file is an instance of File, if it's not we say Required
const fileSchema = z.instanceof(File, {message: "Required"})
const imageSchema = fileSchema.refine(file => file.size === 0 || file.type.startsWith("image/"))

const addSchema = z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    //formData is using string values which is why we need to coerce it to number
    priceInCents: z.coerce.number().int().min(1),
    file: fileSchema.refine(file => file.size > 0, "Required"),
    image: imageSchema.refine(file => file.size > 0, "Required")
})

// actions must be async
// prevState does not matter which is why we put it to unknown
export async function addProduct(prevState: unknown, formData: FormData) {
    const result = addSchema.safeParse(Object.fromEntries(formData.entries()))
    if(result.success === false) {
        return result.error.formErrors.fieldErrors
    }

    const data = result.data

    // create the path where we want the file to save it to:
    await fs.mkdir("products", { recursive:true })
    const filePath = `products/${crypto.randomUUID()}-${data.file.name}`
    // add/save the file to the actual file path:
    await fs.writeFile(filePath, Buffer.from(await data.file.arrayBuffer()))
    // --> it converts the file into a Buffer and we can pass the Buffer along to writeFile - essentially we are just taking our file from the state its currently in and converting it into a file that node.js knows how to use

    await fs.mkdir("public/products", { recursive:true })
    const imagePath = `/products/${crypto.randomUUID()}-${data.image.name}`
    await fs.writeFile(`public${imagePath}`, Buffer.from(await data.image.arrayBuffer()))

    db.product.create({ data: {
        isAvailableForPurchase: false,
        name: data.name,
        description: data.description,
        priceInCents: data.priceInCents,
        //first safe the file to the file system before we actually can safe the path to them inside of the database which we do with await fs. ... further up
        filePath,
        imagePath
    }})

    redirect("/admin/products")
}

export async function toggleProductAvailability(id: string, isAvailableForPurchase: boolean) {
    await db.product.update({ where: { id }, data: { isAvailableForPurchase } })
}

export async function deleteProduct(id: string) {
    const product = await db.product.delete( {where: { id }})
    if(product == null) return notFound()
}