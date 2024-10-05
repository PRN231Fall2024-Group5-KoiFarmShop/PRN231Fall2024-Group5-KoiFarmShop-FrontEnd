import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatPriceVND } from "@/lib/utils";
import { addToCart } from "@/lib/cart";
import { KoiFish } from "@/lib/api/koiFishApi";
import { useToast } from "@/hooks/use-toast";

interface KoiCardProps {
  koi: KoiFish;
}

const KoiCard: React.FC<KoiCardProps> = ({ koi }) => {
  const { toast } = useToast();

  const handleAddToCart = () => {
    addToCart(koi);
    toast({
      title: "Added to cart",
      description: `${koi.name} has been added to your cart.`,
    });
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-primary bg-white shadow">
      <div className="relative aspect-[3/4] w-full">
        <Image
          src={
            koi.koiFishImages[0]?.imageUrl ||
            "/koi-farm-generic-koi-thumbnail.jpg"
          }
          alt={koi.name}
          fill
          style={{ objectFit: "cover" }}
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <Link href={`/koi/${koi.id}`}>
          <h3 className="mb-2 text-xl font-bold text-primary">{koi.name}</h3>
        </Link>
        <div className="mb-4 rounded bg-slate-100 p-2 text-sm">
          <p className="line-clamp-3">{koi.personalityTraits}</p>
        </div>
        <div className="mt-auto">
          <p className="mb-2 flex flex-row items-center gap-6">
            <span className="font-semibold">Price:</span>
            <span className="text-xl text-primary">
              {formatPriceVND(koi.price)}
            </span>
          </p>
          <Button
            onClick={handleAddToCart}
            className="my-2 w-full border border-primary bg-white text-primary hover:bg-primary hover:text-white"
          >
            Add to Cart
          </Button>
        </div>
        <div className="my-2 flex flex-col gap-3 text-sm text-foreground">
          <p>
            <span className="font-semibold">Breed:</span>{" "}
            {koi.koiBreeds[0].name}
          </p>
          <p>
            <span className="font-semibold">Age:</span> {koi.age} years
          </p>
          <p>
            <span className="font-semibold">Seller:</span> {koi.consignedBy}
          </p>
          <p>
            <span className="font-semibold">Gender:</span> {koi.gender}
          </p>
        </div>
      </div>
    </div>
  );
};

export default KoiCard;
