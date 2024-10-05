import React from "react";

const BuyingGuide: React.FC = () => {
  return (
    <div className="buying-guide">
      <h2 className="mb-4 text-2xl font-bold">Koi Buying Guide</h2>
      <p className="mb-4 font-semibold text-red-600">
        PLEASE READ THIS GUIDE CAREFULLY BEFORE MAKING A PURCHASE.
      </p>
      <p className="mb-4">
        CONTACT US WITH ANY QUESTIONS BEFORE PLACING YOUR ORDER.
      </p>

      <div className="mb-6">
        <h3 className="mb-2 text-xl font-semibold">IMPORTANT</h3>
        <p>
          Before purchasing a koi, please ensure you have a suitable environment
          ready. Koi require a well-maintained pond with proper filtration,
          adequate space, and appropriate water parameters. A typical koi needs
          at least 250 gallons of water, with larger specimens requiring more
          space.
        </p>
      </div>

      <h3 className="mb-2 text-xl font-semibold">BUYING CONSIDERATIONS</h3>
      <ul className="mb-4 list-disc pl-5">
        <li>
          Size and Age: Consider the current size of the koi and its potential
          for growth.
        </li>
        <li>
          Variety: Different koi varieties have different care requirements and
          price points.
        </li>
        <li>
          Health: Look for signs of good health such as clear eyes, undamaged
          fins, and smooth body movement.
        </li>
        <li>
          Purpose: Determine if you're buying for show, breeding, or as a pet.
        </li>
        <li>
          Budget: Quality koi can be a significant investment. Factor in
          long-term care costs as well.
        </li>
      </ul>

      <h3 className="mb-2 text-xl font-semibold">AFTER PURCHASE CARE</h3>
      <p className="mb-4">
        Once you receive your koi, it's crucial to acclimate it properly to its
        new environment:
      </p>
      <ol className="mb-4 list-decimal pl-5">
        <li>
          Float the bag with the koi in your pond for 15-20 minutes to equalize
          temperature.
        </li>
        <li>Gradually add pond water to the bag over the course of an hour.</li>
        <li>Gently release the koi into the pond.</li>
        <li>
          Monitor the koi closely for the first few days and avoid feeding for
          24 hours.
        </li>
      </ol>

      <h3 className="mb-2 text-xl font-semibold">GUARANTEE</h3>
      <p className="mb-4">
        We offer a 24-hour live arrival guarantee on all koi purchases. Any
        issues must be reported within this timeframe. Please refer to our full
        policy for details on our guarantee and return process.
      </p>

      <p className="font-semibold">
        If you have any questions about buying koi, please contact us at +1
        (833) Koi Love (1-833-564-5683) or info@koiworldfarm.com.
      </p>
    </div>
  );
};

export default BuyingGuide;
