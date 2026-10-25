// lib/product-taxonomy.ts

export const TAXONOMY = {
  CATEGORIES: {
    "Ready to Wear": [
      "New Arrivals",
      "Dresses",
      "Tailored Suits",
      "Jackets & Coats",
      "Knitwear",
      "Tops & Shirts",
      "Jeans & Denim",
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
  },
  BRANDS: [
    "Colman Looks",
    "McCollins Exclusive",
    "Heritage Collection",
    "General Stock",
  ],
  COLLECTIONS: {
    Trending: ["Summer Staples", "Office Elegance", "Wedding Guest", "Streetwear"],
    Essentials: ["Premium Tees", "Classic Denim", "Outerwear", "Loungewear"],
    Other: ["None"],
  },
  DEPARTMENTS: ["Men", "Women", "Kids", "Unisex"] as const,
  SIZE_TYPES: [
    { value: "clothing", label: "Clothing (XS, S, M, L, XL, XXL)" },
    { value: "shoes", label: "Shoes (38 - 46 EU)" },
    { value: "none", label: "One Size / Accessories" },
  ] as const,
};

export const ALL_CATEGORIES = Object.values(TAXONOMY.CATEGORIES).flat();
export const ALL_COLLECTIONS = Object.values(TAXONOMY.COLLECTIONS).flat().filter(c => c !== "None");

export function isValidCategory(cat: string): boolean {
  return ALL_CATEGORIES.includes(cat) || cat === "Uncategorized";
}

export function isValidDepartment(dept: string): boolean {
  return (TAXONOMY.DEPARTMENTS as readonly string[]).includes(dept);
}
