import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Hindu Temples in USA - Interactive Map",
  description:
    "Explore Hindu temples across the United States with our interactive map. Filter by state, search by name, and contribute missing temples.",
    generator: 'v0.dev',
  icons: {
     icon: [
      { url: '/marker-icon-om.png', sizes: '32x32', type: 'image/png' },
    ],
  },
  keywords:
    "Hindu temples, USA temples, Hindu worship, mandir directory, temple locations, Hindu community, temple map, BAPS temples, Swaminarayan temples, Shiva temples, Vishnu temples",
  authors: [{ name: "Hindu Temples USA Map" }],
  creator: "Hindu Temples USA Map",
  publisher: "Hindu Temples USA Map",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://hindutemplesofusa.com"), // Replace with your actual domain
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Hindu Temples in USA - Interactive Map & Directory",
    description:
      "Explore a comprehensive interactive map of Hindu temples across the United States. Find temple locations, contact information, and directions.",
    url: "https://hindutemplesofusa.com", 
    siteName: "Hindu Temples USA Map",
    images: [
      {
        url: "/marker-icon-om.png", 
        width: 1200,
        height: 630,
        alt: "Hindu Temples USA Map",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hindu Temples in USA - Interactive Map & Directory",
    description:
      "Explore a comprehensive interactive map of Hindu temples across the United States. Find temple locations, contact information, and directions.",
    images: ["/marker-icon-om.png"], 
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add these once you have them
    google: "hjtCRNafefL4uisBh4SCrYyUx2H66GbpKKs96oIl3dw",
    // yandex: "yandex-verification-code",
    // bing: "bing-verification-code",
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="google-site-verification" content="hjtCRNafefL4uisBh4SCrYyUx2H66GbpKKs96oIl3dw" />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'
