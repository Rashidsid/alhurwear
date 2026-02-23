import "./globals.css";
import { Inter } from "next/font/google";
import { CartProvider } from "./context/CartContext";
import { UserProvider } from "./context/UserContext";
import CartDrawer from "./components/CartDrawer";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-slate-900`}>
        <UserProvider>
          <CartProvider>
            <CartDrawer />
            {children}
          </CartProvider>
        </UserProvider>
      </body>
    </html>
  );
}
