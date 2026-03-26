// Mock data store for AgriBid - no backend yet, using localStorage

import vegetablesImg from "@/assets/vegetables.jpg";
import fruitsImg from "@/assets/fruits.jpg";
import dairyImg from "@/assets/dairy.jpg";
import grainsImg from "@/assets/grains.jpg";
import livestockImg from "@/assets/livestock.jpg";
import machineryImg from "@/assets/machinery.jpg";

// ─── Category Structure ─────────────────────────────────────────────
export interface SubCategory {
  name: string;
  slug: string;
}

export interface Category {
  name: string;
  slug: string;
  icon: string;
  description: string;
  color: string;
  subcategories: SubCategory[];
}

export const categories: Category[] = [
  {
    name: "Primary Farming",
    slug: "primary-farming",
    icon: "🌱",
    description: "Raw products directly from farms",
    color: "bg-primary/10 text-primary",
    subcategories: [
      { name: "Crops", slug: "crops" },
      { name: "Vegetables", slug: "vegetables" },
      { name: "Fruits", slug: "fruits" },
      { name: "Livestock", slug: "livestock" },
      { name: "Poultry", slug: "poultry" },
      { name: "Fishery", slug: "fishery" },
      { name: "Seeds & Seedlings", slug: "seeds-seedlings" },
    ],
  },
  {
    name: "Agro Processing",
    slug: "agro-processing",
    icon: "🏭",
    description: "Value-added, processed goods",
    color: "bg-harvest/10 text-harvest",
    subcategories: [
      { name: "Grain Products", slug: "grain-products" },
      { name: "Dairy Products", slug: "dairy-products" },
      { name: "Meat Products", slug: "meat-products" },
      { name: "Fruit & Veg Products", slug: "fruit-veg-products" },
      { name: "Oils", slug: "oils" },
      { name: "Beverages", slug: "beverages" },
      { name: "Spices & Herbs", slug: "spices-herbs" },
      { name: "Animal Feed", slug: "animal-feed" },
    ],
  },
  {
    name: "Butchery",
    slug: "butchery",
    icon: "🥩",
    description: "Ready-to-sell meat — townships & local delivery",
    color: "bg-auction-hot/10 text-auction-hot",
    subcategories: [
      { name: "Beef Cuts", slug: "beef-cuts" },
      { name: "Chicken", slug: "chicken" },
      { name: "Pork", slug: "pork" },
      { name: "Goat Meat", slug: "goat-meat" },
      { name: "Processed Meat", slug: "processed-meat" },
      { name: "Bulk Meat", slug: "bulk-meat" },
    ],
  },
  {
    name: "Auction",
    slug: "auction",
    icon: "🔨",
    description: "Bidding for bulk & high-value items",
    color: "bg-earth/10 text-earth",
    subcategories: [
      { name: "Livestock Auctions", slug: "livestock-auctions" },
      { name: "Crop Bulk Sales", slug: "crop-bulk-sales" },
      { name: "Equipment", slug: "equipment" },
      { name: "Surplus Stock", slug: "surplus-stock" },
      { name: "Wholesale Lots", slug: "wholesale-lots" },
    ],
  },
];

// ─── Product Types ──────────────────────────────────────────────────
export interface Review {
  id: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  vendor: string;
  vendorId: string;
  price: number;
  unit: string;
  rating: number;
  reviewCount: number;
  images: string[];
  badge?: string;
  category: string;
  subcategory: string;
  description: string;
  moq: number;
  stock: number;
  reviews: Review[];
}

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Organic Tomatoes",
    vendor: "Green Valley Farm",
    vendorId: "v1",
    price: 35.00,
    unit: "kg",
    rating: 4.8,
    reviewCount: 24,
    images: [vegetablesImg, fruitsImg, grainsImg],
    badge: "Fresh",
    category: "primary-farming",
    subcategory: "vegetables",
    description: "Premium organic tomatoes grown without pesticides. Perfect for salads, sauces, and everyday cooking. Hand-picked at peak ripeness for maximum flavour.",
    moq: 5,
    stock: 250,
    reviews: [
      { id: "r1", user: "Thabo M.", rating: 5, comment: "Always fresh and juicy. Best tomatoes in Gauteng!", date: "2026-03-15" },
      { id: "r2", user: "Nomsa K.", rating: 4, comment: "Good quality, fast delivery. Will order again.", date: "2026-03-10" },
    ],
  },
  {
    id: "2",
    name: "Mixed Fruit Basket",
    vendor: "Sunrise Orchards",
    vendorId: "v2",
    price: 189.99,
    unit: "basket",
    rating: 4.9,
    reviewCount: 56,
    images: [fruitsImg, vegetablesImg, dairyImg],
    badge: "Popular",
    category: "primary-farming",
    subcategory: "fruits",
    description: "A curated basket of seasonal fruits including bananas, mangoes, oranges, and apples. Perfect for families or office fruit bowls.",
    moq: 1,
    stock: 80,
    reviews: [
      { id: "r3", user: "Linda P.", rating: 5, comment: "Beautiful selection, everything was ripe and ready to eat.", date: "2026-03-18" },
    ],
  },
  {
    id: "3",
    name: "Artisan Cheese Selection",
    vendor: "Mountain Dairy Co.",
    vendorId: "v3",
    price: 125.00,
    unit: "pack",
    rating: 4.7,
    reviewCount: 18,
    images: [dairyImg, grainsImg, vegetablesImg],
    category: "agro-processing",
    subcategory: "dairy-products",
    description: "Handcrafted cheese assortment featuring cheddar, gouda, and brie. Made from free-range cow's milk with no artificial preservatives.",
    moq: 2,
    stock: 45,
    reviews: [
      { id: "r4", user: "James R.", rating: 5, comment: "Restaurant quality cheese at a fair price!", date: "2026-03-12" },
    ],
  },
  {
    id: "4",
    name: "Premium Basmati Rice",
    vendor: "Golden Harvest Mills",
    vendorId: "v4",
    price: 45.00,
    unit: "kg",
    rating: 4.6,
    reviewCount: 42,
    images: [grainsImg, vegetablesImg, fruitsImg],
    badge: "Bulk Deal",
    category: "agro-processing",
    subcategory: "grain-products",
    description: "Long-grain aromatic basmati rice, perfect for biryanis and everyday meals. Available in bulk for restaurants and catering businesses.",
    moq: 10,
    stock: 500,
    reviews: [
      { id: "r5", user: "Sipho N.", rating: 4, comment: "Great quality rice. We use it in our restaurant daily.", date: "2026-03-08" },
    ],
  },
  {
    id: "5",
    name: "Beef Steak Cuts — Grade A",
    vendor: "Veld Butchery",
    vendorId: "v5",
    price: 189.00,
    unit: "kg",
    rating: 4.9,
    reviewCount: 67,
    images: [livestockImg, machineryImg, vegetablesImg],
    badge: "🔥 Hot",
    category: "butchery",
    subcategory: "beef-cuts",
    description: "Premium Grade A beef steak cuts, aged for 21 days. Sourced from free-range cattle in the Eastern Cape. Vacuum-packed for freshness.",
    moq: 3,
    stock: 120,
    reviews: [
      { id: "r6", user: "Bongani M.", rating: 5, comment: "Best steaks I've ever had. Melt in your mouth!", date: "2026-03-19" },
      { id: "r7", user: "Sarah L.", rating: 5, comment: "We ordered for a braai — everyone was impressed.", date: "2026-03-14" },
    ],
  },
  {
    id: "6",
    name: "Boerewors — Traditional Recipe",
    vendor: "Veld Butchery",
    vendorId: "v5",
    price: 129.00,
    unit: "kg",
    rating: 4.8,
    reviewCount: 89,
    images: [livestockImg, dairyImg, grainsImg],
    badge: "Best Seller",
    category: "butchery",
    subcategory: "processed-meat",
    description: "Authentic South African boerewors made with premium beef and traditional spices. Perfect for braais and everyday cooking.",
    moq: 2,
    stock: 200,
    reviews: [
      { id: "r8", user: "Pieter V.", rating: 5, comment: "Tastes like my ouma's recipe. Absolutely lekker!", date: "2026-03-17" },
    ],
  },
  {
    id: "7",
    name: "Free-Range Chicken Portions",
    vendor: "Kwa-Zulu Poultry",
    vendorId: "v6",
    price: 89.00,
    unit: "kg",
    rating: 4.5,
    reviewCount: 33,
    images: [livestockImg, vegetablesImg, fruitsImg],
    category: "butchery",
    subcategory: "chicken",
    description: "Fresh free-range chicken portions. No hormones or antibiotics. Available in breast, thigh, and drumstick cuts.",
    moq: 5,
    stock: 150,
    reviews: [],
  },
  {
    id: "8",
    name: "Sunflower Oil — 5L Bulk",
    vendor: "Golden Harvest Mills",
    vendorId: "v4",
    price: 95.00,
    unit: "bottle",
    rating: 4.4,
    reviewCount: 21,
    images: [grainsImg, dairyImg, fruitsImg],
    category: "agro-processing",
    subcategory: "oils",
    description: "Pure cold-pressed sunflower oil in a 5-litre bottle. Ideal for cooking, frying, and baking. Great for tuck shops and catering.",
    moq: 4,
    stock: 300,
    reviews: [],
  },
  {
    id: "9",
    name: "Cape Wine Grapes — Red Blend",
    vendor: "Stellenbosch Vineyards",
    vendorId: "v7",
    price: 220.00,
    unit: "case",
    rating: 4.9,
    reviewCount: 45,
    images: [fruitsImg, vegetablesImg, grainsImg],
    badge: "Premium",
    category: "primary-farming",
    subcategory: "fruits",
    description: "Premium red wine grapes from Stellenbosch, Western Cape. Perfect for boutique winemakers.",
    moq: 2,
    stock: 60,
    reviews: [],
  },
  {
    id: "10",
    name: "Karoo Lamb — Premium Cuts",
    vendor: "Karoo Meat Collective",
    vendorId: "v8",
    price: 245.00,
    unit: "kg",
    rating: 4.9,
    reviewCount: 38,
    images: [livestockImg, vegetablesImg, dairyImg],
    badge: "🔥 Hot",
    category: "butchery",
    subcategory: "goat-meat",
    description: "Grass-fed Karoo lamb with superior flavour. Tender cuts perfect for fine dining or special occasions.",
    moq: 2,
    stock: 80,
    reviews: [],
  },
  {
    id: "11",
    name: "Rooibos Tea — Organic, Loose",
    vendor: "Cederberg Valley Estate",
    vendorId: "v9",
    price: 185.00,
    unit: "kg",
    rating: 4.8,
    reviewCount: 52,
    images: [fruitsImg, grainsImg, vegetablesImg],
    category: "agro-processing",
    subcategory: "beverages",
    description: "100% organic Rooibos tea from Cederberg. Rich, naturally sweet flavour. Caffeine-free.",
    moq: 1,
    stock: 120,
    reviews: [],
  },
  {
    id: "12",
    name: "Biltong Variety Pack",
    vendor: "Veld Butchery",
    vendorId: "v5",
    price: 165.00,
    unit: "pack",
    rating: 4.9,
    reviewCount: 76,
    images: [livestockImg, dairyImg, grainsImg],
    badge: "Best Seller",
    category: "butchery",
    subcategory: "processed-meat",
    description: "Assorted South African biltong including beef, droëwors, and kudu. Traditional spiced recipes.",
    moq: 1,
    stock: 250,
    reviews: [],
  },
  {
    id: "13",
    name: "Avocados — Hass Variety",
    vendor: "Sunridge Estate",
    vendorId: "v10",
    price: 65.00,
    unit: "dozen",
    rating: 4.7,
    reviewCount: 29,
    images: [fruitsImg, vegetablesImg],
    category: "primary-farming",
    subcategory: "fruits",
    description: "Premium Hass avocados from Sunridge Estate. Rich, creamy texture. Perfect for export quality.",
    moq: 1,
    stock: 180,
    reviews: [],
  },
  {
    id: "14",
    name: "Maize Meal — 25kg Bulk",
    vendor: "Golden Harvest Mills",
    vendorId: "v4",
    price: 185.00,
    unit: "bag",
    rating: 4.6,
    reviewCount: 34,
    images: [grainsImg, vegetablesImg, fruitsImg],
    category: "agro-processing",
    subcategory: "grain-products",
    description: "Premium yellow maize meal in 25kg bags. Milled fresh for superior quality. Bulk discounts available.",
    moq: 4,
    stock: 500,
    reviews: [],
  },
  {
    id: "15",
    name: "Spinach — Bunches, Fresh",
    vendor: "Green Valley Farm",
    vendorId: "v1",
    price: 28.00,
    unit: "bunch",
    rating: 4.8,
    reviewCount: 41,
    images: [vegetablesImg, fruitsImg, dairyImg],
    category: "primary-farming",
    subcategory: "vegetables",
    description: "Fresh organic spinach bunches. Pesticide-free. Harvested daily. Ideal for restaurants and catering.",
    moq: 10,
    stock: 300,
    reviews: [],
  },
  {
    id: "16",
    name: "Sweet Potatoes — Orange",
    vendor: "Garden Pride Farms",
    vendorId: "v11",
    price: 42.00,
    unit: "kg",
    rating: 4.7,
    reviewCount: 27,
    images: [vegetablesImg, fruitsImg, dairyImg],
    category: "primary-farming",
    subcategory: "vegetables",
    description: "Naturally sweet orange sweet potatoes. High in antioxidants. Perfect for restaurants, markets, and retail.",
    moq: 10,
    stock: 220,
    reviews: [],
  },
  {
    id: "17",
    name: "Pork Chops — Premium Cut",
    vendor: "Veld Butchery",
    vendorId: "v5",
    price: 159.00,
    unit: "kg",
    rating: 4.8,
    reviewCount: 44,
    images: [livestockImg, grainsImg, vegetablesImg],
    category: "butchery",
    subcategory: "pork",
    description: "Premium pork chops, locally raised and ethically slaughtered. Tender and flavourful.",
    moq: 2,
    stock: 95,
    reviews: [],
  },
  {
    id: "18",
    name: "Honey — Raw, Unfiltered",
    vendor: "Bee Happy Apiaries",
    vendorId: "v12",
    price: 145.00,
    unit: "bottle",
    rating: 4.9,
    reviewCount: 63,
    images: [grainsImg, fruitsImg, vegetablesImg],
    badge: "Popular",
    category: "agro-processing",
    subcategory: "beverages",
    description: "Raw, unfiltered honey from Bee Happy Apiaries. No additives. Rich in enzymes and nutrients.",
    moq: 1,
    stock: 150,
    reviews: [],
  },
  {
    id: "19",
    name: "Potatoes — White, 20kg",
    vendor: "Farmers Co-op",
    vendorId: "v13",
    price: 125.00,
    unit: "bag",
    rating: 4.5,
    reviewCount: 19,
    images: [vegetablesImg, grainsImg, fruitsImg],
    category: "primary-farming",
    subcategory: "vegetables",
    description: "Grade A white potatoes, 20kg bags. Suitable for retail, catering, and processing.",
    moq: 2,
    stock: 400,
    reviews: [],
  },
  {
    id: "20",
    name: "Onions — Red, 10kg",
    vendor: "Farmers Co-op",
    vendorId: "v13",
    price: 95.00,
    unit: "bag",
    rating: 4.6,
    reviewCount: 22,
    images: [vegetablesImg, fruitsImg, grainsImg],
    category: "primary-farming",
    subcategory: "vegetables",
    description: "Premium red onions, 10kg bags. Sweet and mild flavour. Perfect for salads and cooking.",
    moq: 3,
    stock: 350,
    reviews: [],
  },
  {
    id: "21",
    name: "Butternut Squash — Box",
    vendor: "Garden Pride Farms",
    vendorId: "v11",
    price: 185.00,
    unit: "box",
    rating: 4.7,
    reviewCount: 31,
    images: [vegetablesImg, dairyImg, fruitsImg],
    category: "primary-farming",
    subcategory: "vegetables",
    description: "Fresh butternut squash in 15kg boxes. Creamy texture, perfect for soups and roasting.",
    moq: 1,
    stock: 120,
    reviews: [],
  },
  {
    id: "22",
    name: "Beef Mince — 500g Packs",
    vendor: "Veld Butchery",
    vendorId: "v5",
    price: 75.00,
    unit: "pack",
    rating: 4.8,
    reviewCount: 55,
    images: [livestockImg, vegetablesImg, dairyImg],
    category: "butchery",
    subcategory: "beef-cuts",
    description: "Fresh beef mince in convenient 500g packs. Lean, quality meat. Perfect for burgers and sauces.",
    moq: 1,
    stock: 400,
    reviews: [],
  },
  {
    id: "23",
    name: "Yogurt — Plain, 5L Bulk",
    vendor: "Mountain Dairy Co.",
    vendorId: "v3",
    price: 85.00,
    unit: "container",
    rating: 4.7,
    reviewCount: 28,
    images: [dairyImg, fruitsImg, vegetablesImg],
    category: "agro-processing",
    subcategory: "dairy-products",
    description: "Plain yogurt made from fresh cow's milk. No additives. Great for restaurants and cafés.",
    moq: 2,
    stock: 200,
    reviews: [],
  },
  {
    id: "24",
    name: "Bananas — Cavendish, Bunches",
    vendor: "Tropical Harvest",
    vendorId: "v14",
    price: 35.00,
    unit: "bunch",
    rating: 4.6,
    reviewCount: 37,
    images: [fruitsImg, vegetablesImg, grainsImg],
    category: "primary-farming",
    subcategory: "fruits",
    description: "Fresh Cavendish bananas, carefully packaged. Ready to ripen at home. Great for wholesale.",
    moq: 5,
    stock: 280,
    reviews: [],
  },
  {
    id: "25",
    name: "Brown Bread — Wholesale Pack",
    vendor: "Golden Harvest Mills",
    vendorId: "v4",
    price: 240.00,
    unit: "pack",
    rating: 4.5,
    reviewCount: 15,
    images: [grainsImg, vegetablesImg, dairyImg],
    category: "agro-processing",
    subcategory: "grain-products",
    description: "Freshly baked brown bread in packs of 12. No preservatives. Perfect for retailers.",
    moq: 1,
    stock: 180,
    reviews: [],
  },
  {
    id: "26",
    name: "Carrots — Orange, 15kg",
    vendor: "Farmers Co-op",
    vendorId: "v13",
    price: 105.00,
    unit: "bag",
    rating: 4.7,
    reviewCount: 26,
    images: [vegetablesImg, fruitsImg, grainsImg],
    category: "primary-farming",
    subcategory: "vegetables",
    description: "Fresh orange carrots, 15kg bags. Sweet and crunchy. Great for baby food and juice.",
    moq: 2,
    stock: 300,
    reviews: [],
  },
  {
    id: "27",
    name: "Biltong — Beef Strips",
    vendor: "Karoo Meat Collective",
    vendorId: "v8",
    price: 385.00,
    unit: "kg",
    rating: 4.9,
    reviewCount: 67,
    images: [livestockImg, dairyImg, vegetablesImg],
    badge: "🔥 Hot",
    category: "butchery",
    subcategory: "processed-meat",
    description: "Premium Karoo beef biltong, hand-sliced. Traditional spices. Best-seller nationwide.",
    moq: 1,
    stock: 200,
    reviews: [],
  },
  {
    id: "28",
    name: "Mushrooms — Mixed Fresh",
    vendor: "Green Valley Farm",
    vendorId: "v1",
    price: 125.00,
    unit: "kg",
    rating: 4.8,
    reviewCount: 33,
    images: [vegetablesImg, fruitsImg, dairyImg],
    category: "primary-farming",
    subcategory: "vegetables",
    description: "Mixed fresh mushrooms including oyster, button, and shiitake. Organic, pesticide-free.",
    moq: 2,
    stock: 80,
    reviews: [],
  },
  {
    id: "29",
    name: "Sorghum — Grains, 25kg",
    vendor: "Golden Harvest Mills",
    vendorId: "v4",
    price: 220.00,
    unit: "bag",
    rating: 4.6,
    reviewCount: 18,
    images: [grainsImg, vegetablesImg, fruitsImg],
    category: "agro-processing",
    subcategory: "grain-products",
    description: "Premium sorghum grains in 25kg bags. High nutritional value. suitable for animal feed and beer production.",
    moq: 4,
    stock: 250,
    reviews: [],
  },
  {
    id: "30",
    name: "Chicken Drumsticks — 5kg",
    vendor: "Kwa-Zulu Poultry",
    vendorId: "v6",
    price: 145.00,
    unit: "box",
    rating: 4.6,
    reviewCount: 29,
    images: [livestockImg, vegetablesImg, grainsImg],
    category: "butchery",
    subcategory: "chicken",
    description: "Fresh chicken drumsticks in 5kg boxes. Free-range, hormone-free. Perfect for grilling.",
    moq: 2,
    stock: 180,
    reviews: [],
  },
];

// ─── Vendor / Seller Types ──────────────────────────────────────────
export interface Vendor {
  id: string;
  name: string;
  location: string;
  rating: number;
  products: number;
  verified: boolean;
  specialty: string;
  logo?: string;
  bio: string;
  joinDate: string;
}

export const mockVendors: Vendor[] = [
  { id: "v1", name: "Green Valley Farm", location: "Limpopo, SA", rating: 4.9, products: 87, verified: true, specialty: "Organic Vegetables", bio: "Family-owned organic farm supplying fresh produce since 2015.", joinDate: "2024-01-15" },
  { id: "v2", name: "Sunrise Orchards", location: "Mpumalanga, SA", rating: 4.8, products: 54, verified: true, specialty: "Seasonal Fruits", bio: "Premium fruit orchards spanning 200 hectares of fertile land.", joinDate: "2024-03-20" },
  { id: "v3", name: "Mountain Dairy Co.", location: "Western Cape, SA", rating: 4.7, products: 32, verified: true, specialty: "Artisan Dairy", bio: "Craft dairy products from free-range cattle.", joinDate: "2024-06-10" },
  { id: "v5", name: "Veld Butchery", location: "Eastern Cape, SA", rating: 4.9, products: 45, verified: true, specialty: "Premium Meat", bio: "Grade A meat supplier specialising in aged beef and traditional boerewors.", joinDate: "2024-02-01" },
  { id: "v4", name: "Golden Harvest Mills", location: "Free State, SA", rating: 4.6, products: 28, verified: true, specialty: "Grains & Oils", bio: "Bulk grain processor and oil manufacturer.", joinDate: "2024-05-12" },
  { id: "v6", name: "Kwa-Zulu Poultry", location: "KZN, SA", rating: 4.5, products: 19, verified: false, specialty: "Free-Range Poultry", bio: "Free-range chicken farm providing hormone-free poultry.", joinDate: "2025-01-08" },
  { id: "v7", name: "Stellenbosch Vineyards", location: "Western Cape, SA", rating: 4.9, products: 23, verified: true, specialty: "Wine Grapes", bio: "Premium wine grape producers in the heart of Stellenbosch.", joinDate: "2024-04-15" },
  { id: "v8", name: "Karoo Meat Collective", location: "Northern Cape, SA", rating: 4.9, products: 31, verified: true, specialty: "Grass-Fed Meat", bio: "Ethical grass-fed lamb and goat meat from the Karoo region.", joinDate: "2024-03-01" },
  { id: "v9", name: "Cederberg Valley Estate", location: "Western Cape, SA", rating: 4.8, products: 15, verified: true, specialty: "Rooibos & Herbs", bio: "Organic Rooibos tea and herbal products from Cederberg.", joinDate: "2024-07-20" },
  { id: "v10", name: "Sunridge Estate", location: "Limpopo, SA", rating: 4.7, products: 22, verified: true, specialty: "Avocados & Citrus", bio: "Premium export-quality avocados and citrus fruits.", joinDate: "2024-05-10" },
  { id: "v11", name: "Garden Pride Farms", location: "Gauteng, SA", rating: 4.7, products: 35, verified: true, specialty: "Fresh Vegetables", bio: "Year-round vegetable production using modern farming techniques.", joinDate: "2024-02-28" },
  { id: "v12", name: "Bee Happy Apiaries", location: "North West, SA", rating: 4.9, products: 12, verified: true, specialty: "Raw Honey", bio: "Small-batch raw honey from diverse flower sources.", joinDate: "2024-08-05" },
  { id: "v13", name: "Farmers Co-op", location: "Free State, SA", rating: 4.6, products: 48, verified: true, specialty: "Root Vegetables", bio: "Cooperative of small-scale farmers producing quality potatoes and vegetables.", joinDate: "2024-01-20" },
  { id: "v14", name: "Tropical Harvest", location: "Mpumalanga, SA", rating: 4.6, products: 18, verified: true, specialty: "Tropical Fruits", bio: "Bananas, pawpaws, and tropical fruits from Mpumalanga.", joinDate: "2024-06-15" },
];

// ─── Auction Types ──────────────────────────────────────────────────
export interface Auction {
  id: string;
  title: string;
  image: string;
  currentBid: number;
  totalBids: number;
  endsInMs: number;
  vendor: string;
  vendorId: string;
  category: string;
  description: string;
}

export const mockAuctions: Auction[] = [
  {
    id: "a1",
    title: "Premium Hereford Cattle (Lot of 5)",
    image: livestockImg,
    currentBid: 187500,
    totalBids: 23,
    endsInMs: 2 * 3600 * 1000 + 34 * 60 * 1000,
    vendor: "Riverside Ranch",
    vendorId: "v1",
    category: "livestock-auctions",
    description: "5 head of premium Hereford cattle, all vaccinated and in excellent condition.",
  },
  {
    id: "a2",
    title: "John Deere 6120M Tractor — 2023 Model",
    image: machineryImg,
    currentBid: 675000,
    totalBids: 8,
    endsInMs: 5 * 3600 * 1000 + 12 * 60 * 1000,
    vendor: "AgriEquip Dealers",
    vendorId: "v4",
    category: "equipment",
    description: "Low-hour 2023 John Deere 6120M with full service history. One owner.",
  },
  {
    id: "a3",
    title: "Bulk Organic Wheat — 50 Tonnes",
    image: grainsImg,
    currentBid: 123000,
    totalBids: 15,
    endsInMs: 45 * 60 * 1000,
    vendor: "Golden Harvest Mills",
    vendorId: "v4",
    category: "crop-bulk-sales",
    description: "50 tonnes of certified organic wheat, freshly harvested. Collection from Free State.",
  },
  {
    id: "a4",
    title: "Free-Range Chicken Flock (200 Birds)",
    image: livestockImg,
    currentBid: 45000,
    totalBids: 18,
    endsInMs: 3 * 3600 * 1000 + 25 * 60 * 1000,
    vendor: "Kwa-Zulu Poultry",
    vendorId: "v6",
    category: "livestock-auctions",
    description: "200 head of healthy, free-range chickens ready for production. Recently vaccinated.",
  },
  {
    id: "a5",
    title: "Agricultural Irrigation System — Complete Setup",
    image: machineryImg,
    currentBid: 285000,
    totalBids: 12,
    endsInMs: 1 * 3600 * 1000 + 55 * 60 * 1000,
    vendor: "AgriTech Solutions",
    vendorId: "v4",
    category: "equipment",
    description: "Pivot irrigation system with 40-hectare coverage. Includes pump and control systems.",
  },
  {
    id: "a6",
    title: "Maize Harvest Bulk — 100 Tonnes Grade A",
    image: grainsImg,
    currentBid: 285000,
    totalBids: 31,
    endsInMs: 8 * 3600 * 1000 + 15 * 60 * 1000,
    vendor: "Farmers Co-op",
    vendorId: "v13",
    category: "crop-bulk-sales",
    description: "100 tonnes of Grade A maize from Free State. Ready for collection or delivery.",
  },
  {
    id: "a7",
    title: "Dairy Cattle — Jersey Herd (15 Cows)",
    image: livestockImg,
    currentBid: 195000,
    totalBids: 22,
    endsInMs: 4 * 3600 * 1000 + 45 * 60 * 1000,
    vendor: "Mountain Dairy Co.",
    vendorId: "v3",
    category: "livestock-auctions",
    description: "15 high-yielding Jersey dairy cows, all milking. Recently tested and certified.",
  },
  {
    id: "a8",
    title: "Soil Compactor & Roller Equipment",
    image: machineryImg,
    currentBid: 95000,
    totalBids: 9,
    endsInMs: 6 * 3600 * 1000 + 30 * 60 * 1000,
    vendor: "Construction Equipment Ltd",
    vendorId: "v4",
    category: "equipment",
    description: "Heavy-duty soil compactor in excellent working condition. Low hours on engine.",
  },
  {
    id: "a9",
    title: "Premium Wine Grapes — 50 Tonnes Harvest",
    image: fruitsImg,
    currentBid: 175000,
    totalBids: 19,
    endsInMs: 2 * 3600 * 1000 + 20 * 60 * 1000,
    vendor: "Stellenbosch Vineyards",
    vendorId: "v7",
    category: "crop-bulk-sales",
    description: "Premium red wine grapes harvested at peak ripeness. Perfect for boutique winemaking.",
  },
  {
    id: "a10",
    title: "Brahman Cattle Breeding Stock (10 Cows + 2 Bulls)",
    image: livestockImg,
    currentBid: 320000,
    totalBids: 27,
    endsInMs: 7 * 3600 * 1000 + 10 * 60 * 1000,
    vendor: "Karoo Livestock Exchange",
    vendorId: "v8",
    category: "livestock-auctions",
    description: "Pedigree Brahman cattle ideal for breeding. Excellent genetics, healthy bloodline.",
  },
  {
    id: "a11",
    title: "Combine Harvester — Claas Lexion 600",
    image: machineryImg,
    currentBid: 485000,
    totalBids: 14,
    endsInMs: 9 * 3600 * 1000 + 5 * 60 * 1000,
    vendor: "AgriEquip Dealers",
    vendorId: "v4",
    category: "equipment",
    description: "Claas Lexion 600 combine harvester, 2020 model. Well-maintained, full service history.",
  },
  {
    id: "a12",
    title: "Surplus Grain Stock — Mixed Varieties 75T",
    image: grainsImg,
    currentBid: 185000,
    totalBids: 11,
    endsInMs: 12 * 3600 * 1000 + 40 * 60 * 1000,
    vendor: "Golden Harvest Mills",
    vendorId: "v4",
    category: "surplus-stock",
    description: "Surplus grain including sorghum, sunflower, and barley. Quick sale needed.",
  },
  {
    id: "a13",
    title: "Goat Herd — 50 Dairy Goats",
    image: livestockImg,
    currentBid: 85000,
    totalBids: 16,
    endsInMs: 1 * 3600 * 1000 + 15 * 60 * 1000,
    vendor: "Karoo Meat Collective",
    vendorId: "v8",
    category: "livestock-auctions",
    description: "50 healthy dairy goats, perfect for milk production. Strong genetics.",
  },
  {
    id: "a14",
    title: "Vegetable Processing Equipment Package",
    image: machineryImg,
    currentBid: 125000,
    totalBids: 7,
    endsInMs: 10 * 3600 * 1000 + 25 * 60 * 1000,
    vendor: "Food Processing Solutions",
    vendorId: "v4",
    category: "equipment",
    description: "Complete vegetable processing line including sorting, washing, and packaging equipment.",
  },
  {
    id: "a15",
    title: "Rooibos Tea Harvest — 25 Tonnes Organic",
    image: grainsImg,
    currentBid: 92500,
    totalBids: 20,
    endsInMs: 3 * 3600 * 1000 + 50 * 60 * 1000,
    vendor: "Cederberg Valley Estate",
    vendorId: "v9",
    category: "crop-bulk-sales",
    description: "Organic Rooibos tea from Cederberg, harvested and dried. Ready for processing.",
  },
];

// ─── Cart ───────────────────────────────────────────────────────────
export interface CartItem {
  productId: string;
  quantity: number;
}

export const getCart = (): CartItem[] => {
  try {
    return JSON.parse(localStorage.getItem("agribid-cart") || "[]");
  } catch { return []; }
};

export const saveCart = (cart: CartItem[]) => {
  localStorage.setItem("agribid-cart", JSON.stringify(cart));
};

export const addToCart = (productId: string, quantity: number): CartItem[] => {
  const cart = getCart();
  const existing = cart.find(i => i.productId === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ productId, quantity });
  }
  saveCart(cart);
  return cart;
};

// ─── Currency ───────────────────────────────────────────────────────
export const formatZAR = (amount: number): string => {
  return `R${amount.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// ─── Seller Registration (localStorage) ─────────────────────────────
export interface SellerProfile {
  id: string;
  businessName: string;
  email: string;
  phone: string;
  location: string;
  specialty: string;
  bio: string;
  logo?: string;
  // Verification fields
  idNumber?: string;
  registrationDocument?: string;
  businessAddress?: string;
  taxNumber?: string;
  verificationStatus?: "pending" | "approved" | "rejected";
  verificationDate?: string;
  rejectionReason?: string;
  bankAccount?: string;
  bankName?: string;
}

export const getSellerProfile = (): SellerProfile | null => {
  try {
    const data = localStorage.getItem("agribid-seller");
    return data ? JSON.parse(data) : null;
  } catch { return null; }
};

export const saveSellerProfile = (profile: SellerProfile) => {
  localStorage.setItem("agribid-seller", JSON.stringify(profile));
};
