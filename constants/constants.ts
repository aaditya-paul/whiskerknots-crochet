import { Product, Testimonial } from "../types/types";

export const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Mochi the Chubby Cat",
    price: 35.0,
    category: "amigurumi",
    image: "https://picsum.photos/id/1074/400/400",
    description:
      "A soft, squishy companion ready for cuddles. Made with velvet yarn.",
    isFeatured: true,
    slug: "mochi-the-chubby-cat",
  },
  {
    id: "2",
    name: "Sunflower Tote Bag",
    price: 45.0,
    category: "wearables",
    image: "https://picsum.photos/id/1082/400/400",
    description:
      "Carry a little sunshine everywhere you go. Durable cotton blend.",
    isFeatured: true,
    slug: "sunflower-tote-bag",
  },
  {
    id: "3",
    name: "Cozy Cable Knit Beanie",
    price: 28.0,
    category: "wearables",
    image: "https://picsum.photos/id/1025/400/400",
    description: "Keep your ears warm with this classic, chunky beanie.",
    slug: "cozy-cable-knit-beanie",
  },
  {
    id: "4",
    name: "Sleepy Fox Plush",
    price: 42.0,
    category: "amigurumi",
    image: "https://picsum.photos/id/1003/400/400",
    description: "The perfect nap time buddy for woodland adventures.",
    isFeatured: true,
    slug: "sleepy-fox-plush",
  },
  {
    id: "5",
    name: "Boho Hanging Planter",
    price: 22.0,
    category: "decor",
    image: "https://picsum.photos/id/1056/400/400",
    description:
      "Add some greenery to your room with this macrame-style crochet hanger.",
    slug: "boho-hanging-planter",
  },
  {
    id: "6",
    name: "Pastel Granny Square Blanket",
    price: 120.0,
    category: "decor",
    image: "https://picsum.photos/id/1020/400/400",
    description: "A labor of love. Perfect for chilly evenings on the couch.",
    slug: "pastel-granny-square-blanket",
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    name: "Sarah J.",
    text: "I bought the Mochi cat for my niece and she won't let it go! The quality is amazing.",
    rating: 5,
  },
  {
    id: "t2",
    name: "Mike R.",
    text: "The beanie is so warm and fits perfectly. Love the sustainable packaging too!",
    rating: 5,
  },
  {
    id: "t3",
    name: "Emily W.",
    text: "Whiskerknots is my go-to for baby shower gifts. Always so cute and unique.",
    rating: 5,
  },
];
