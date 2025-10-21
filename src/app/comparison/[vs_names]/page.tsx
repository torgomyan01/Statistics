import VsPage from "../components/vs-page";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ vs_names: string }>;
}): Promise<Metadata> {
  const { vs_names } = await params;

  const [country1, country2] = vs_names.split("-vs-");

  return {
    title: `Comparison ${country1.toUpperCase()} vs ${country2.toUpperCase()}`,
    description: "Comparison",
    openGraph: {
      title: "Comparison",
      description: "Comparison",
      siteName: "Comparison",
    },
  };
}

async function Page() {
  return <VsPage />;
}

export default Page;
