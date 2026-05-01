import { getAllCollections } from "@/lib/shopify";
import { CollectionsHubClient } from "@/components/collections-hub-client";
import { MobileCollectionsHub } from "@/components/mobile/mobile-collections-hub";
import Image from "next/image";
import ExploreButton from "@/components/explore-button";

export default async function CollectionsHub() {
  // Fetch all collections dynamically
  const allCollections = await getAllCollections();
  
  // Find Landing Page collection for the "All Products" cover
  const landingPageCollection = allCollections.find(c => c.title.toLowerCase() === 'landing page');
  const allProductsImage = landingPageCollection?.image?.url || "/collections_hero.jpg";

  // Filter out "Landing Page" from the Browse Categories section
  const filteredCollections = allCollections.filter(c => c.title.toLowerCase() !== 'landing page');

  return (
    <>
      {/* Mobile View - Entirely Different Experience */}
      <div className="md:hidden">
        <MobileCollectionsHub 
          collections={filteredCollections}
          allProductsImage={allProductsImage}
        />
      </div>

      {/* Desktop View - Zero Changes */}
      <main className="hidden md:block min-h-screen bg-white text-black font-sans relative overflow-x-hidden">
        {/* Editorial Hero - Static Server Content */}
        <section className="relative w-full h-screen overflow-hidden flex flex-row pt-[80px] bg-white">
          {/* Left Column: Typography */}
          <div className="w-[30%] h-full flex flex-col justify-center px-[6%] z-20">
            <h2 className="text-[70px] font-serif leading-[0.9] italic mb-8 text-black tracking-tight">Style,<br />Redefined</h2>
            <div className="space-y-10">
              <p className="text-[9px] font-bold tracking-[0.4em] uppercase text-black/60 leading-relaxed font-sans pr-4">
                Uncomplicated, Essential Pieces<br />You'll Reach For Again And Again.
              </p>
              <ExploreButton />
            </div>
          </div>

          {/* Right Column: Photography */}
          <div className="w-[70%] h-full relative p-12">
            <Image
              src="/collections_hero.jpg"
              alt="Editorial Collections Hero"
              fill
              className="object-contain object-center"
              priority
              unoptimized={true}
            />
          </div>
        </section>

        {/* Interactive Categories Grid - Client Component for Motion */}
        <CollectionsHubClient 
          collections={filteredCollections}
          allProductsImage={allProductsImage}
        />
      </main>
    </>
  );
}
