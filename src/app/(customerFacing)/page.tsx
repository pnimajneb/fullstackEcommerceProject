import ProductCard, { ProductCardSkeleton } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import db from "@/db/db";
import cache from "@/lib/cache";
import { Product } from "@prisma/client";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
// the folder customerFacing is in parentices (Route Group) because I don't want it to change the URL but it allows me to create a new layout for the pages inside it

// To cache the following two functions I need to convert them from normal functions to a const variable and set it equal to calling the custom cache function and passing it in as an arrow function
// the array must be a unique identifier like so "["/", "getMostPopularProducts"]"
const getMostPopularProducts = cache(
  () => {
    //await wait(1000);
    return db.product.findMany({
      where: { isAvailableForPurchase: true },
      orderBy: { orders: { _count: "desc" } },
      take: 6,
    });
  },
  ["/", "getMostPopularProducts"],
  // update the most popular products every 24 hours
  { revalidate: 60 * 60 * 24 }
);

const getNewestProducts = cache(() => {
  return db.product.findMany({
    where: { isAvailableForPurchase: true },
    orderBy: { createdAt: "desc" },
    take: 6,
  });
}, ["/", "getNewestProducts"]);

// function wait(duration: number) {
//   return new Promise((resolve) => setTimeout(resolve, duration));
// }

export default function HomePage() {
  return (
    <main className="space-y-12">
      <ProductGridSection
        productsFetcher={getMostPopularProducts}
        title="Most Popular"
      />
      <ProductGridSection productsFetcher={getNewestProducts} title="Newest" />
    </main>
  );
}

type ProductGridSectionProps = {
  title: string;
  productsFetcher: () => Promise<Product[]>;
};

function ProductGridSection({
  productsFetcher,
  title,
}: ProductGridSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <h2 className="text-3xl font-bold">{title}</h2>
        <Button variant="outline" asChild>
          <Link href="/products" className="space-x-2">
            <span>View All</span>
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Suspense
          fallback={
            <>
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
            </>
          }
        >
          <ProductSuspense productsFetcher={productsFetcher} />
        </Suspense>
      </div>
    </div>
  );
}

// we need to do this because the async await function needs to be in a separate component
async function ProductSuspense({
  productsFetcher,
}: {
  productsFetcher: () => Promise<Product[]>;
}) {
  return (await productsFetcher()).map((product) => (
    <ProductCard key={product.id} {...product} />
  ));
}
