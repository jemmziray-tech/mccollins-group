export const PRODUCT_CATEGORIES = {
  "Ready to Wear": [
    "New Arrivals",
    "Dresses",
    "Tailored Suits",
    "Jackets & Coats",
    "Knitwear",
    "Tops & Shirts",
  ],
  Footwear: [
    "Classic Boots",
    "Heels & Wedges",
    "Premium Sneakers",
    "Formal Shoes",
    "Sandals",
  ],
  Accessories: [
    "Luxury Bags",
    "Leather Belts",
    "Fine Jewellery",
    "Sunglasses",
    "Watches",
  ],
} as const;

export const PRODUCT_BRANDS = [
  "Colman Looks",
  "McCollins Exclusive",
  "Heritage Collection",
  "General Stock",
] as const;

export const PRODUCT_COLLECTIONS = {
  Trending: ["Summer Staples", "Office Elegance", "Wedding Guest", "Streetwear"],
  Essentials: ["Premium Tees", "Classic Denim", "Outerwear", "Loungewear"],
  Other: ["None"],
} as const;

const LEGACY_CATEGORIES = ["Shirts", "Outerwear", "Denim", "Footwear", "Accessories", "Uncategorized"] as const;

export const PRODUCT_CATEGORY_OPTIONS = [...Object.values(PRODUCT_CATEGORIES).flat(), ...LEGACY_CATEGORIES];
export const PRODUCT_COLLECTION_OPTIONS = Object.values(PRODUCT_COLLECTIONS).flat();
