import BetaHome from "./components/beta-home";

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "WebSite", "@id": "https://pullvio.com/#website", name: "Pullvio", url: "https://pullvio.com/" },
    {
      "@type": "Organization",
      "@id": "https://pullvio.com/#organization",
      name: "Pullvio",
      url: "https://pullvio.com/",
      logo: "https://pullvio.com/icon.svg",
      email: "hello@pullvio.com",
    },
  ],
};

export default function Home() {
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} /><BetaHome locale="en" /></>;
}
