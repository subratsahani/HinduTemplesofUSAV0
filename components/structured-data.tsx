export default function StructuredData() {
  const templeMapData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Hindu Temples USA Map",
    description: "An interactive map of Hindu temples across the United States",
    applicationCategory: "ReligiousApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    author: {
      "@type": "Organization",
      name: "Hindu Temples USA Map",
      url: "https://hindutemplesofusa.com", 
    },
  }

  const localBusinessData = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Hindu Temples in the United States",
    description:
      "A comprehensive directory of Hindu temples across the United States, including locations, contact information, and directions.",
    keywords: ["Hindu temples", "USA temples", "mandir", "Hindu worship", "temple directory"],
    creator: {
      "@type": "Organization",
      name: "Hindu Temples USA Map",
      url: "https://hindutemplesofusa.com", 
    },
    license: "https://creativecommons.org/licenses/by/4.0/",
    distribution: [
      {
        "@type": "DataDownload",
        encodingFormat: "application/json",
        contentUrl: "https://hindutemplesofusa.com/api/send-feedback", // Replace with your actual API endpoint if you have one
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(templeMapData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessData) }} />
    </>
  )
}
