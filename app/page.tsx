import type { Metadata } from "next";
import LocalizedHome from "./components/localized-home";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
    languages: {
      en: "/",
      "zh-CN": "/zh-cn",
      es: "/es",
      "x-default": "/",
    },
  },
};

export default function Home() {
  return <LocalizedHome locale="en" />;
}
