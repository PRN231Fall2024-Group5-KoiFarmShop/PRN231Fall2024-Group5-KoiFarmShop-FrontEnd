import React from "react";
import PolicyGuide from "../koi/[koiId]/components/PolicyGuide";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const PolicyPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-[url('https://www.kodamakoifarm.com/wp-content/uploads/2024/01/kodama_menu-bg.jpg')]">
        <div className="container mx-auto max-w-6xl">
          <Breadcrumb className="py-4 text-primary">
            <BreadcrumbList>
              <BreadcrumbItem className="text-primary">
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
                <BreadcrumbSeparator />
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink href="/policy">Policy</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="container mx-auto mt-8 max-w-6xl pb-8">
        <h1 className="mb-6 text-3xl font-bold">Our Policy</h1>
        <div className="rounded-lg bg-[#F9F5EC] p-6">
          <PolicyGuide />
        </div>
      </div>
    </div>
  );
};

export default PolicyPage;
