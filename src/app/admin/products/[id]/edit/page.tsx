import db from "@/db/db";
import { PageHeader } from "../../../_components/PageHeader";
import { ProductForm } from "../../_components/ProductForm";

// the edit page is also going to take in the product information which is why we have the dynamic parameter
export default async function EditProductPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const product = await db.product.findUnique({ where: { id } });
  return (
    <>
      <PageHeader>Edit Product</PageHeader>
      {/* we have to pass down the product to our form - and there, in the ProductForm, we have to pass in the props into the function! */}
      <ProductForm product={product} />
    </>
  );
}
