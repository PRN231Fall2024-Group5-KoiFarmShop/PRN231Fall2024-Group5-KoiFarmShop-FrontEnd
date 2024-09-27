"use client";
import React, { useState, ChangeEvent } from "react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import InfoSection from "./components/InfoSection";
import FAQSection from "./components/FAQSection";
import KoiCard from "./components/KoiCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

interface Breed {
  id: string;
  name: string;
  description: string;
  faqs: { question: string; answer: string }[];
  kois: Koi[];
}

interface KoiBreedShowcasePageProps {
  breed: Breed;
}

const KoiBreedShowcasePage = ({ params }: { params: { breedId: string } }) => {
  const { breedId } = params;

  const [breed, setBreed] = useState<Breed>({
    id: breedId,
    name: "Kohaku",
    description:
      "Kohaku is a variety of ornamental koi with a white body and red markings.",
    faqs: [
      {
        question: "What is the ideal water temperature for Kohaku?",
        answer:
          "The ideal water temperature for Kohaku is between 65-75°F (18-24°C).",
      },
      {
        question: "What should I feed my Kohaku?",
        answer:
          "Kohaku should be fed a balanced diet of high-quality koi pellets, supplemented with fresh vegetables and occasional treats like shrimp or worms.",
      },
    ],
    kois: [
      {
        id: "1",
        name: "Tancho Kohaku",
        thumbnail: "/koi-farm-generic-koi-thumbnail.jpg",
        age: 2,
        breed: "Kohaku",
        seller: "Seller A",
        sex: "Male",
        description:
          "Beautiful Tancho Kohaku, 84 cm at 4 years old, originating from Dainichi. Impressive body shape for its young age. The vibrant red marking on its head is perfectly circular, a hallmark of high-quality Tancho. Its scales shimmer with a pearlescent glow, indicating excellent health and genetics.",
        price: 1000,
      },
      {
        id: "2",
        name: "Showa Sanshoku",
        thumbnail: "/koi-farm-generic-koi-thumbnail.jpg",
        age: 3,
        breed: "Showa",
        seller: "Seller B",
        sex: "Female",
        description:
          "Elegant Showa Sanshoku with striking black, red, and white patterns. Well-proportioned body and vibrant colors. The sumi (black) is developing nicely, creating a beautiful contrast with the hi (red) and shiroji (white). This koi shows great potential for further color enhancement as it matures.",
        price: 1500,
      },
      {
        id: "3",
        name: "Asagi",
        thumbnail: "/koi-farm-generic-koi-thumbnail.jpg",
        age: 1,
        breed: "Asagi",
        seller: "Seller C",
        sex: "Male",
        description:
          "Young Asagi with promising blue scales and red highlights. Great potential for growth and color development. The reticulated net pattern on its back is already well-defined, and the hi (red) on its sides is starting to show. With proper care, this Asagi could become a stunning example of its variety.",
        price: 800,
      },
      {
        id: "4",
        name: "Kujaku",
        thumbnail: "/koi-farm-generic-koi-thumbnail.jpg",
        age: 4,
        breed: "Kujaku",
        seller: "Seller D",
        sex: "Female",
        description:
          "Mature Kujaku with a mesmerizing platinum base and intricate black net pattern. The red hi stretches beautifully along the back, complementing the metallic sheen. This koi's fins display a delicate, lace-like pattern, adding to its ethereal beauty. A true gem for any discerning collector.",
        price: 2000,
      },
      {
        id: "5",
        name: "Chagoi",
        thumbnail: "/koi-farm-generic-koi-thumbnail.jpg",
        age: 5,
        breed: "Chagoi",
        seller: "Seller E",
        sex: "Male",
        description:
          "Friendly Chagoi with a rich, chocolate-brown color that deepens towards the back. Known for their docile nature, this koi is perfect for hand-feeding. Its large, powerful body glides gracefully through the water, showcasing the breed's renowned growth potential. An excellent choice for beginners and experienced keepers alike.",
        price: 1200,
      },
    ],
  });

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortOption, setSortOption] = useState<string>("newest");

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (value: string) => {
    setSortOption(value);
  };

  const filteredKois = breed.kois.filter((koi) =>
    koi.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const sortedKois = [...filteredKois].sort((a, b) => {
    switch (sortOption) {
      case "newest":
        // Assuming newer kois have higher IDs
        return parseInt(b.id) - parseInt(a.id);
      case "price-low-high":
        return a.price - b.price;
      case "price-high-low":
        return b.price - a.price;
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen">
      <div className="bg-[url('https://www.kodamakoifarm.com/wp-content/uploads/2024/01/kodama_menu-bg.jpg')]">
        <div className="container mx-auto max-w-6xl">
          <Breadcrumb className="py-4 text-primary">
            <BreadcrumbList>
              <BreadcrumbItem className="text-primary">
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
                <BreadcrumbSeparator />
              </BreadcrumbItem>
              <BreadcrumbItem className="text-primary">
                <BreadcrumbLink href="/breeds">Breeds</BreadcrumbLink>
                <BreadcrumbSeparator />
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/breed/${breedId}`}>
                  {breedId}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="container mx-auto mt-2 max-w-6xl pb-8">
        <div className="flex flex-col gap-4 rounded-xl border-2 border-[#F4F0E7] p-6">
          {/* Info Section */}
          <InfoSection title={breed.name} description={breed.description} />

          {/* FAQ Section */}
          <FAQSection faqs={breed.faqs} />
        </div>
        {/* Koi List Section */}
        <div className="koi-list-section mt-8">
          <div className="mb-4 flex items-center justify-between gap-8">
            <input
              type="text"
              placeholder="Search Koi..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="rounded border border-primary bg-white p-2 text-primary"
            />
            <Select value={sortOption} onValueChange={handleSortChange}>
              <SelectTrigger className="max-w-[200px] rounded border border-primary bg-white p-2 text-primary">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-white text-primary">
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low-high">
                  Price: Low to High
                </SelectItem>
                <SelectItem value="price-high-low">
                  Price: High to Low
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sortedKois.map((koi) => (
              <KoiCard key={koi.id} koi={koi} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KoiBreedShowcasePage;
