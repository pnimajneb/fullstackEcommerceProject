"use server"
// this file refers to the form in the ProductForm.tsx for which we need actions. in the _actions folder we insert different .ts files that point to different components

import db from "@/db/db"
import { z } from "zod"
import fs from "fs/promises"
import { notFound, redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

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

// if I update, delete, add etc. a product I need to make sure that I revalidate the caches which is why I need to revalidate the paths of most of the functions below

// actions must be async
// prevState does not matter which is why we put it to unknown
export async function addProduct(prevState: unknown, formData: FormData) {  
    const result = addSchema.safeParse(Object.fromEntries(formData.entries()))
    if(result.success === false) {
        return result.error.formErrors.fieldErrors
    }

    const data = result.data

    // create the path where we want the file to save it to:
    await fs.mkdir("products", { recursive: true })
    const filePath = `products/${crypto.randomUUID()}-${data.file.name}`
    // add/save the file to the actual file path:
    await fs.writeFile(filePath, Buffer.from(await data.file.arrayBuffer()))
    // --> it converts the file into a Buffer and we can pass the Buffer along to writeFile - essentially we are just taking our file from the state its currently in and converting it into a file that node.js knows how to use

    await fs.mkdir("public/products", { recursive: true })
    const imagePath = `/products/${crypto.randomUUID()}-${data.image.name}`
    await fs.writeFile(`public${imagePath}`, Buffer.from(await data.image.arrayBuffer()))

    await db.product.create({ data: {
        isAvailableForPurchase: false,
        name: data.name,
        description: data.description,
        priceInCents: data.priceInCents,
        //first safe the file to the file system before we actually can safe the path to them inside of the database which we do with await fs. ... further up
        filePath,
        imagePath,
    }})

    revalidatePath("/")
    revalidatePath("/products")
    
    redirect("/admin/products")
}

const editSchema = addSchema.extend({
    file: fileSchema.optional(),
    image: imageSchema.optional()
})

export async function updateProduct(id: string, prevState: unknown, formData: FormData) {
    const result = editSchema.safeParse(Object.fromEntries(formData.entries()))
    if(result.success === false) {
        return result.error.formErrors.fieldErrors
    }

    const data = result.data
    const product = await db.product.findUnique({where: { id }})

    if(product ==  null) return notFound()

    // let's update our product based on all the information
    // we only want to update the file- and the imagePath if they actually change
    let filePath = product.filePath
    if(data.file != null && data.file.size > 0) {
    //then we want to upload the file which means delete the old file und create a new one:
    // first: unlink the original file:
    await fs.unlink(product.filePath)
    // second: create a path to a new file and save that file:
    filePath = `products/${crypto.randomUUID()}-${data.file.name}`
    await fs.writeFile(filePath, Buffer.from(await data.file.arrayBuffer()))
    }
    
    let imagePath = product.imagePath
    if(data.image != null && data.image.size > 0) {
    await fs.unlink(`public${product.imagePath}`)
    imagePath = `/products/${crypto.randomUUID()}-${data.image.name}`
    await fs.writeFile(`public${imagePath}`, Buffer.from(await data.image.arrayBuffer()))
    }

    await db.product.update({ 
        where: { id },
        data: {
        name: data.name,
        description: data.description,
        priceInCents: data.priceInCents,
        //first safe the file to the file system before we actually can safe the path to them inside of the database which we do with await fs. ... further up
        filePath,
        imagePath,
    }})
    revalidatePath("/")
    revalidatePath("/products")
    
    redirect("/admin/products")
}

export async function toggleProductAvailability(id: string, isAvailableForPurchase: boolean) {
    await db.product.update({ where: { id }, data: { isAvailableForPurchase } })

    revalidatePath("/")
    revalidatePath("/products")
}

export async function deleteProduct(id: string) {
    const product = await db.product.delete( {where: { id }})
    if(product == null) return notFound()

    // deleting the files in the public/products folder structure
    await fs.unlink(product.filePath)
    await fs.unlink(`public${product.imagePath}`)

    revalidatePath("/")
    revalidatePath("/products")
}