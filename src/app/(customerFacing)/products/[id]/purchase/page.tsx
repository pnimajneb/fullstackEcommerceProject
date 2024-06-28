import db from "@/db/db";
import { notFound } from "next/navigation";
import Stripe from "stripe";

// this must occur serverside and not clientside because the secret key needs to be passed in here
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export default async function PurchasePage({
  params: { id },
}: {
  params: { id: string };
}) {
  const product = await db.product.findUnique({ where: { id } });

  if (product == null) return notFound();

  //we want to enable the customer to make payments:
  stripe.paymentIntents.create({
    amount: product.priceInCents,
    currency: "USD",
    metadata:
  });

  return <h1>hi</h1>;
}
