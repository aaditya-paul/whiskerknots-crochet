"use client";

import React from "react";
import { Instagram, Facebook, Twitter, Heart } from "lucide-react";
import { useRouter } from "next/navigation";

const Footer: React.FC = () => {
  const router = useRouter();
  return (
    <footer className="bg-orange-50 dark:bg-dark-surface pt-16 pb-8 border-t border-orange-100 dark:border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-xl font-bold text-earthy-brown dark:text-dark-peach mb-4 flex items-center gap-2">
              <Heart
                size={18}
                className="text-rose-500 dark:text-dark-rose"
                fill="currentColor"
              />
              Whiskerknots
            </h3>
            <p className="text-gray-600 dark:text-dark-muted mb-6 leading-relaxed">
              Handmade crochet goods crafted with patience, passion, and loops
              of love. Bringing coziness to your world, one stitch at a time.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="bg-white dark:bg-dark-bg p-2 rounded-full shadow-sm text-rose-400 dark:text-dark-rose hover:text-rose-600 dark:hover:text-rose-500 hover:shadow-md transition-all"
              >
                <Instagram size={20} />
              </a>
              <a
                href="#"
                className="bg-white dark:bg-dark-bg p-2 rounded-full shadow-sm text-blue-400 hover:text-blue-600 dark:hover:text-blue-500 hover:shadow-md transition-all"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                className="bg-white dark:bg-dark-bg p-2 rounded-full shadow-sm text-sky-400 hover:text-sky-600 dark:hover:text-sky-500 hover:shadow-md transition-all"
              >
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-earthy-brown dark:text-dark-peach mb-4">
              Explore
            </h4>
            <ul className="space-y-3 text-gray-600 dark:text-dark-muted">
              <li>
                <button
                  onClick={() => router.push("/shop")}
                  className="hover:text-rose-500 dark:hover:text-dark-rose transition-colors cursor-pointer"
                >
                  Shop All
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push("/shop")}
                  className="hover:text-rose-500 dark:hover:text-dark-rose transition-colors cursor-pointer"
                >
                  Amigurumi
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push("/shop")}
                  className="hover:text-rose-500 dark:hover:text-dark-rose transition-colors cursor-pointer"
                >
                  Wearables
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push("/shop")}
                  className="hover:text-rose-500 dark:hover:text-dark-rose transition-colors cursor-pointer"
                >
                  Home Decor
                </button>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-earthy-brown dark:text-dark-peach mb-4">
              Support
            </h4>
            <ul className="space-y-3 text-gray-600 dark:text-dark-muted">
              <li>
                <button
                  onClick={() => router.push("/contact")}
                  className="hover:text-rose-500 dark:hover:text-dark-rose transition-colors cursor-pointer"
                >
                  Contact Us
                </button>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-rose-500 dark:hover:text-dark-rose transition-colors cursor-pointer"
                >
                  Shipping Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-rose-500 dark:hover:text-dark-rose transition-colors cursor-pointer"
                >
                  Care Instructions
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-rose-500 dark:hover:text-dark-rose transition-colors cursor-pointer"
                >
                  Returns
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-bold text-earthy-brown dark:text-dark-peach mb-4">
              Join the Club
            </h4>
            <p className="text-gray-600 dark:text-dark-muted mb-4 text-sm">
              Get 10% off your first order and exclusive access to new drops!
            </p>
            <form className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-2 rounded-xl border border-orange-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-300 dark:focus:ring-dark-rose bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
              <button className="bg-rose-400 dark:bg-dark-rose text-white font-bold py-2 rounded-xl hover:bg-rose-500 dark:hover:bg-rose-600 transition-colors">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-orange-200 dark:border-gray-800 pt-8 text-center text-gray-500 dark:text-dark-muted text-sm">
          <p>
            &copy; {new Date().getFullYear()} Whiskerknots Crochet. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
