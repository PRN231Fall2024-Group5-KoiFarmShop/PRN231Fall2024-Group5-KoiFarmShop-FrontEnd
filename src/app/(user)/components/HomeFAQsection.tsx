import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import faqAPI from "@/lib/api/faqAPI";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

function HomeFAQsection() {
  // Fetch FAQs using React Query
  const { data: faqResponse, isLoading } = useQuery({
    queryKey: ["faqs"],
    queryFn: () => faqAPI.getAll(),
  });

  // Loading state UI
  if (isLoading) {
    return (
      <section className="bg-white py-16">
        <div className="container mx-auto max-w-[1200px] px-4 text-center">
          <h2 className="mb-6 text-3xl font-medium">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // If no FAQs or error, don't render the section
  if (!faqResponse?.isSuccess || !faqResponse.data.length) {
    return null;
  }

  const faqs = faqResponse.data.filter((faq) => !faq.isDeleted);

  return (
    <section className="w-full max-w-[1200px] bg-white py-16">
      <div className="container mx-auto max-w-[1200px] px-4 text-center">
        <h2 className="mb-6 text-3xl font-medium">
          Frequently Asked Questions
        </h2>
      </div>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq) => (
          <AccordionItem key={faq.id} value={`item-${faq.id}`}>
            <AccordionTrigger>{faq.question}</AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

export default HomeFAQsection;
