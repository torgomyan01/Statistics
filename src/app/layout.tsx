import "./globals.scss";
import "../icons/icons.css";

import "./tailwind.css";

import NextTopLoader from "nextjs-toploader";

import { Providers } from "@/app/providers";
import { UiProviders } from "@/components/UIProvider/ui-provider";
import { ThemeProvider } from "next-themes";

export async function generateMetadata() {
  return {
    title: "Enhance Website",
    description: "",
    keywords: [],
    // alternates: {
    //   canonical: "https://galamat.kz",
    // },
    // openGraph: {
    //   title: data.data.name,
    //   description: data.data.description?.slice(0, 140),
    //   images: image?.image || "",
    // },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider attribute="class">
      <html lang="ru" suppressHydrationWarning={true}>
        <body>
          <NextTopLoader />
          <Providers>
            <UiProviders>{children}</UiProviders>
          </Providers>
        </body>
      </html>
    </ThemeProvider>
  );
}
