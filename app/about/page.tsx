import Image from "next/image";
import React from "react";
import { Heart, Coffee, Sun } from "lucide-react";

function Page() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-[3rem] p-8 md:p-16 shadow-sm border border-orange-50 overflow-hidden relative">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-100 rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-100 rounded-full blur-3xl opacity-60 translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-earthy-brown mb-8 leading-tight">
              A Story Woven with <span className="text-rose-400">Passion</span>
            </h1>
            <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
              <p>
                Welcome to <strong>Whiskerknots Crochet</strong>! It all started
                on a rainy Sunday afternoon with a single ball of yarn and a
                crochet hook. What began as a hobby to pass the time quickly
                turned into a deep passion for creating cute, comforting
                tangible objects.
              </p>
              <p>
                The name &quot;Whiskerknots&quot; comes from my two favorite
                things: my curious cat (who loves to inspect every skein of
                yarn) and the intricate knots that make up this beautiful craft.
              </p>
              <p>
                Our mission is simple: <strong>Loops of Love</strong>. We
                believe that a handmade gift carries a warmth that mass-produced
                items just can&apos;t match. Whether it&apos;s a plushie for a
                little one or a beanie for a cold day, we want our creations to
                bring a smile to your face.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
              <div className="flex flex-col items-center text-center p-4 bg-orange-50 rounded-2xl">
                <Heart className="text-rose-400 mb-3" size={32} />
                <h4 className="font-bold text-earthy-brown">Handmade</h4>
                <p className="text-sm text-gray-500">100% crafted by hand</p>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-orange-50 rounded-2xl">
                <Sun className="text-yellow-400 mb-3" size={32} />
                <h4 className="font-bold text-earthy-brown">Quality</h4>
                <p className="text-sm text-gray-500">Premium soft yarn</p>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-orange-50 rounded-2xl">
                <Coffee className="text-earthy-brown mb-3" size={32} />
                <h4 className="font-bold text-earthy-brown">Cozy</h4>
                <p className="text-sm text-gray-500">Warm vibes only</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <Image
                width={300}
                height={400}
                src="https://picsum.photos/id/1012/300/400"
                alt="Process"
                className="rounded-3xl shadow-lg w-full h-64 object-cover transform translate-y-8 rotate-2"
              />

              <Image
                width={300}
                height={400}
                src="https://picsum.photos/id/1027/300/400"
                alt="Yarn Collection"
                className="rounded-3xl shadow-lg w-full h-64 object-cover transform -translate-y-4 -rotate-2"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;
