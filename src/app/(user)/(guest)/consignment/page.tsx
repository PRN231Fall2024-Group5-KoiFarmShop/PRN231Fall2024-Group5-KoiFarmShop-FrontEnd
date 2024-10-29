import React from "react";

const ConsignmentPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Koi Consignment Guide</h1>

      <p className="mb-4">
        99% of Koi fish owners hope their Koi will be "married" into a good
        family, ensuring a good life and future. Some people only raise Koi out
        of passion and don't have enough connections to exchange or sell
        beautiful Koi. Therefore, Koi Farm applies the policy of Koi fish
        consignment – Selling Koi fish on behalf of owners.
      </p>

      <p className="mb-4">
        However, we have strict consignment principles and processes. We ensure
        that we sell Koi at their true value to passionate Koi enthusiasts.
      </p>

      <h2 className="mb-4 mt-6 text-2xl font-semibold">
        Koi Consignment Process
      </h2>
      <p className="mb-4">There are two main ways to consign Koi:</p>
      <ol className="mb-4 list-inside list-decimal">
        <li className="mb-2">
          <strong>Offline Koi consignment:</strong> The consignor provides
          information about the Koi to be consigned through: photos, videos,
          certificates, etc.
        </li>
        <li className="mb-2">
          <strong>Online Koi consignment:</strong> The consignor already has
          detailed information, photos, videos, certificates of the Koi to be
          consigned uploaded on the website system/information storage software.
        </li>
      </ol>

      <p className="mb-4">
        <strong>Note:</strong> Offline Koi consignment is suitable for Koi
        owners who don't have a website or professional Koi data management
        software. These customers typically raise Koi out of passion and
        participate in Koi communities on social forums. They consign Koi to
        upgrade to different Koi or change personal plans. Online Koi
        consignment is for people who raise Koi for business, have a website
        system, and data software (level of professionalism depends on scale).
        They need to expand their customer network, so they consign at large Koi
        Farms.
      </p>

      <h3 className="mb-4 mt-6 text-xl font-semibold">
        Consignment Process Steps:
      </h3>
      <ol className="mb-4 list-inside list-decimal">
        <li className="mb-2">
          Take detailed photos of the Koi to be consigned, provide video of the
          consigned Koi showing its condition.
        </li>
        <li className="mb-2">
          Provide information: Name, age, gender, origin, breed, personality,
          amount of food/day. Any diseases it has had (if any). Provide
          certificates.
        </li>
        <li className="mb-2">
          Koi Farm directly inspects the Koi (if deemed necessary).
        </li>
        <li className="mb-2">
          Both parties negotiate the consignment contract based on the wishes,
          requirements, and consignment price proposed by the customer.
        </li>
        <li className="mb-2">
          Sign the consignment contract (if successful). From the time of
          successful consignment, the customer must ensure the fish is healthy
          as committed.
        </li>
        <li className="mb-2">
          When Koi Farm finds a potential buyer, they directly support the
          customer to view the fish. Care until the fish is sold or not.
        </li>
        <li className="mb-2">
          Fish sold successfully. Consignment contract ends. The customer is
          responsible to the fish buyer for the quality and warranty of the Koi
          in the future.
        </li>
      </ol>

      <h2 className="mb-4 mt-6 text-2xl font-semibold">
        Koi Consignment Policy
      </h2>
      <ol className="mb-4 list-inside list-decimal">
        <li className="mb-2">
          We only accept healthy Koi, free from diseases, with sufficient
          quality and value. Size varies by breed (we don't accept baby koi,
          mini koi, koi fry), average from 35 - 90 cm.
        </li>
        <li className="mb-2">
          Koi must have a certificate, with priority given to purebred Koi from
          Japan. They should originate from large Koi Farms in Japan.
        </li>
        <li className="mb-2">
          The consignment customer is fully responsible for the Koi's quality,
          certificate, age, and health.
        </li>
        <li className="mb-2">
          We commit to providing honest and complete information about your
          Koi's condition. We support and guide potential buyers in detail,
          helping ensure the Koi has the best life in the future.
        </li>
        <li className="mb-2">
          We assist in re-evaluating the Koi's value according to market reality
          and customer needs.
        </li>
        <li className="mb-2">
          Consignment fees are reasonable and appropriate to the Koi's value.
        </li>
        <li className="mb-2">
          All Koi consignment customers must follow the process as outlined
          above.
        </li>
      </ol>

      {/* Add more sections here */}
    </div>
  );
};

export default ConsignmentPage;
