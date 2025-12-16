import type { Metadata } from "next";
import { Quicksand, Comfortaa } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatAssistant from "@/components/ChatAssistant";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";
import FavoritesDrawer from "@/components/FavoritesDrawer";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
});

const comfortaa = Comfortaa({
  variable: "--font-comfortaa",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Whiskerknots - Handmade Crochet Creations | Loops of Love",
  description: "Discover unique handmade crochet items crafted with love. From adorable amigurumi to cozy wearables and charming home decor. Each piece is a one-of-a-kind creation made with premium yarns.",
  keywords: ["crochet", "handmade", "amigurumi", "yarn crafts", "handcrafted gifts", "crochet plushies", "custom crochet", "artisan crafts"],
  authors: [{ name: "Whiskerknots" }],
  creator: "Whiskerknots",
  publisher: "Whiskerknots",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://whiskerknotscrochet.com",
    title: "Whiskerknots - Handmade Crochet Creations",
    description: "Unique handmade crochet items crafted with love. Amigurumi, wearables, and home decor.",
    siteName: "Whiskerknots",
  },
  twitter: {
    card: "summary_large_image",
    title: "Whiskerknots - Handmade Crochet Creations",
    description: "Unique handmade crochet items crafted with love.",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={` ${quicksand.variable} ${comfortaa.variable}  antialiased`}
      >
        <CartProvider>
          <div className="font-serif">
            <Navbar />
            {children}
            <Footer />
            <ChatAssistant />
            <CartDrawer />
            <FavoritesDrawer />
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
