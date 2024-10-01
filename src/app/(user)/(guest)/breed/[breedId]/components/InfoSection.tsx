import React from "react";

interface InfoSectionProps {
  title: string;
  description: string;
}

const InfoSection: React.FC<InfoSectionProps> = ({ title, description }) => {
  return (
    <section className="info-section">
      <h1 className="text-2xl font-bold text-primary">{title}</h1>
      <p>{description}</p>
    </section>
  );
};

export default InfoSection;
