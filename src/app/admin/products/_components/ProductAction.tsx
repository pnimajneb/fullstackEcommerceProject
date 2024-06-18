"use client";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useTransition } from "react";
import {
  deleteProduct,
  toggleProductAvailability,
} from "../../_actions/products";

export function ActiveDropdownToggleItem({
  id,
  isAvailableForPurchase,
}: {
  id: string;
  isAvailableForPurchase: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  return (
    <DropdownMenuItem
      disabled={isPending}
      onClick={() => {
        //async function is doing the toggling of our actual active state
        startTransition(async () => {
          //toggleProductAvailability is an action that we created a function for in products.ts
          await toggleProductAvailability(id, !isAvailableForPurchase);
        });
      }}
    >
      {isAvailableForPurchase ? "Deactivate" : "Activate"}
    </DropdownMenuItem>
  );
}

export function DeleteDropdownItem({
  id,
  disabled,
}: {
  id: string;
  disabled: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  return (
    <DropdownMenuItem
      disabled={disabled || isPending}
      onClick={() => {
        //async function is doing the toggling of our actual active state
        startTransition(async () => {
          //toggleProductAvailability is an action that we created a function for in products.ts
          await deleteProduct(id);
        });
      }}
    >
      Delete
    </DropdownMenuItem>
  );
}
