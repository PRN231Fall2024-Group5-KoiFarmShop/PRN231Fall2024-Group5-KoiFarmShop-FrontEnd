import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface Koi {
  id: string;
  name: string;
  thumbnail: string;
  age: number;
  breed: string;
  seller: string;
  sex: string;
  description: string;
  price: number;
}

interface KoiCardProps {
  koi: Koi;
}

const KoiCard: React.FC<KoiCardProps> = ({ koi }) => {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-primary bg-white shadow">
      <div className="relative aspect-[3/4] w-full">
        <Image
          src={koi.thumbnail || "/koi-farm-generic-koi-thumbnail.jpg"}
          alt={koi.name}
          fill
          style={{ objectFit: "cover" }}
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="mb-2 text-xl font-bold text-primary">{koi.name}</h3>
        <div className="mb-4 rounded bg-slate-100 p-2 text-sm">
          <p className="line-clamp-3">{koi.description}</p>
        </div>
        <div className="mt-auto">
          <p className="mb-2 flex flex-row items-center gap-6">
            <span className="font-semibold">Price:</span>
            <span className="text-xl text-primary">${koi.price}</span>
          </p>
          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary">
            Order Now
          </Button>
        </div>
        <div className="mb-4 flex flex-col gap-3 text-sm text-foreground">
          <p>
            <span className="font-semibold">Breed:</span> {koi.breed}
          </p>
          <p>
            <span className="font-semibold">Age:</span> {koi.age} years
          </p>
          <p>
            <span className="font-semibold">Seller:</span> {koi.seller}
          </p>
          <p>
            <span className="font-semibold">Sex:</span> {koi.sex}
          </p>
        </div>
      </div>
    </div>
  );
};

export default KoiCard;
