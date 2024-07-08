"use client";

import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

type CheckoutFormProps = {
  product: {};
  clientSecret: string;
};

console.log("Stripe Public Key:", process.env.NEW_PUBLIC_STRIPE_PUBLIC_KEY);

const stripePromise = loadStripe(
  process.env.NEW_PUBLIC_STRIPE_PUBLIC_KEY as string
);

export function CheckoutForm({ product, clientSecret }: CheckoutFormProps) {
  // Elements comes from stripe and takes in two major properties. ALSO: it is just a context wrapper that gives us the context for stripe and so on. Therefore, we need another components inside of Elements

  return (
    // by using the apprearance option I can style the payment element the way I want
    <div className="max-w-5xl w-full mx-auto space-y-8">
      <Elements options={{ clientSecret }} stripe={stripePromise}>
        <Form />
      </Elements>
    </div>
  );
}

function Form() {
  const stripe = useStripe();
  const elements = useElements();

  return <PaymentElement />;
}
