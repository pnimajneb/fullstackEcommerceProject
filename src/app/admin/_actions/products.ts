"use server"
// this file refers to the form in the ProductForm.tsx for which we need actions. in the _actions folder we insert different .ts files that point to different components

// actions must be async
export async function addProduct(formData: FormData) {
    console.log(formData)
}