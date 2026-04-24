import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Package, Search, MapPin, Star, Phone, MessageCircle,
  TrendingUp, Users, IndianRupee, Filter, Eye, Handshake, Wheat,
  Apple, Carrot, Leaf, CheckCircle2, Clock,
  Trash2, Send, Download,
  SlidersHorizontal, User as UserIcon
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import {
  cancelStorageListing,
  getUserStorageListings,
  onStorageMarketUpdated,
  StorageListing,
} from "@/lib/storageMarket";

interface Product {
  id: string;
  storageBookingId: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  location: string;
  quality: string;
  status: "active" | "negotiating" | "sold";
  listedDate: string;
  image: string;
  inquiries: number;
  description?: string;
}

interface Buyer {
  id: string;
  name: string;
  type: string;
  location: string;
  rating: number;
  totalDeals: number;
  interestedIn: string[];
  verified: boolean;
  phone: string;
  lastActive: string;
}

const mapStorageListingToProduct = (listing: StorageListing): Product => ({
  id: listing.id,
  storageBookingId: listing.storageBookingId,
  name: listing.name,
  category: listing.category,
  quantity: listing.availableKg,
  unit: "Kg",
  pricePerUnit: listing.pricePerKg,
  location: listing.location,
  quality: listing.quality,
  status: listing.status,
  listedDate: listing.listedDate,
  image: listing.image,
  inquiries: listing.inquiries,
  description: listing.description,
});

const WEST_BENGAL_BUYER_LOCATIONS = [
  "Kolkata, West Bengal",
  "Howrah, West Bengal",
  "Siliguri, West Bengal",
  "Durgapur, West Bengal",
  "Asansol, West Bengal",
  "Kharagpur, West Bengal",
  "Haldia, West Bengal",
  "Malda, West Bengal",
  "Berhampore, West Bengal",
  "Krishnanagar, West Bengal",
  "Jalpaiguri, West Bengal",
  "Cooch Behar, West Bengal",
  "Bardhaman, West Bengal",
  "Bankura, West Bengal",
  "Purulia, West Bengal",
  "Barasat, West Bengal",
  "Barrackpore, West Bengal",
  "Nabadwip, West Bengal",
  "Midnapore, West Bengal",
  "Darjeeling, West Bengal",
];

const NON_WB_BUYER_LOCATIONS = [
  "Delhi NCR",
  "Mumbai, Maharashtra",
  "Pune, Maharashtra",
  "Ahmedabad, Gujarat",
  "Surat, Gujarat",
  "Lucknow, UP",
  "Agra, UP",
  "Patna, Bihar",
  "Bhubaneswar, Odisha",
  "Hyderabad, Telangana",
  "Bengaluru, Karnataka",
  "Chennai, Tamil Nadu",
  "Kochi, Kerala",
  "Jaipur, Rajasthan",
  "Indore, MP",
  "Ludhiana, Punjab",
  "Nagpur, Maharashtra",
  "Guwahati, Assam",
  "Raipur, Chhattisgarh",
  "Ranchi, Jharkhand",
];

const BUYER_NAME_PREFIX = [
  "Fresh",
  "Agro",
  "Green",
  "Harvest",
  "Farm",
  "Prime",
  "Urban",
  "Royal",
  "Bharat",
  "East",
];

const BUYER_NAME_SUFFIX = [
  "Mart",
  "Foods",
  "Distributors",
  "Wholesale",
  "Traders",
  "Retail",
  "Supply Co.",
  "Export House",
];

const BUYER_TYPES = ["Wholesaler", "Retailer", "Exporter", "Distributor"];
const BUYER_ACTIVE_LABELS = ["15 min ago", "30 min ago", "1 hour ago", "2 hours ago", "5 hours ago", "Today"];

function seededRandom(seed: number) {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function pickOne<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

function generateInterestedCategories(rand: () => number): string[] {
  const pool = ["Grains", "Vegetables", "Fruits", "Spices"];
  const count = 1 + Math.floor(rand() * 3);
  const picked: string[] = [];

  while (picked.length < count) {
    const candidate = pickOne(pool, rand);
    if (!picked.includes(candidate)) picked.push(candidate);
  }

  return picked;
}

function generateBuyerDemoData(total = 120, westBengalCount = 80, seed = 2026): Buyer[] {
  const rand = seededRandom(seed);
  const targetTotal = Math.max(1, total);
  const wbCount = Math.min(Math.max(0, westBengalCount), targetTotal);
  const buyers: Buyer[] = [];

  for (let i = 0; i < targetTotal; i++) {
    const isWestBengal = i < wbCount;
    const locationPool = isWestBengal ? WEST_BENGAL_BUYER_LOCATIONS : NON_WB_BUYER_LOCATIONS;
    const location = locationPool[i % locationPool.length];
    const type = pickOne(BUYER_TYPES, rand);
    const prefix = pickOne(BUYER_NAME_PREFIX, rand);
    const suffix = pickOne(BUYER_NAME_SUFFIX, rand);
    const firstDigit = 6 + Math.floor(rand() * 4);
    const phoneNumber = `${firstDigit}${Math.floor(rand() * 1000000000).toString().padStart(9, "0")}`;

    buyers.push({
      id: `B${i + 1}`,
      name: `${prefix}${i + 1} ${suffix}`,
      type,
      location,
      rating: Number((4 + rand() * 1).toFixed(1)),
      totalDeals: 40 + Math.floor(rand() * 280),
      interestedIn: generateInterestedCategories(rand),
      verified: rand() > 0.2,
      phone: `+91 ${phoneNumber.slice(0, 5)} ${phoneNumber.slice(5)}`,
      lastActive: pickOne(BUYER_ACTIVE_LABELS, rand),
    });
  }

  return buyers;
}

const mockBuyers: Buyer[] = generateBuyerDemoData(120, 80);

const categories = ["All", "Grains", "Vegetables", "Fruits", "Spices"];
const categoryIcons: Record<string, React.ReactNode> = {
  Grains: <Wheat className="w-4 h-4" />,
  Vegetables: <Carrot className="w-4 h-4" />,
  Fruits: <Apple className="w-4 h-4" />,
  Spices: <Leaf className="w-4 h-4" />,
};

const statusConfig = {
  active: { label: "Active", icon: CheckCircle2, variant: "default" as const },
  negotiating: { label: "Negotiating", icon: Clock, variant: "secondary" as const },
  sold: { label: "Sold", icon: Handshake, variant: "outline" as const },
};

export default function FarmerToMarket() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [connectingBuyer, setConnectingBuyer] = useState<Buyer | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [inquiryProduct, setInquiryProduct] = useState<Product | null>(null);
  const [buyerTypeFilter, setBuyerTypeFilter] = useState("All");
  
  // Advanced Filters State
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minQuantity, setMinQuantity] = useState("");

  const [connectMessage, setConnectMessage] = useState("");
  const [selectedConnectProductIds, setSelectedConnectProductIds] = useState<string[]>([]);
  const [isConnectMessageCustom, setIsConnectMessageCustom] = useState(false);

  const refreshProducts = useCallback((userId: string) => {
    const listings = getUserStorageListings(userId);
    setProducts(listings.map(mapStorageListingToProduct));
  }, []);

  useEffect(() => {
    if (!user?.id) {
      setProducts([]);
      return;
    }

    refreshProducts(user.id);
    const unsubscribe = onStorageMarketUpdated(() => refreshProducts(user.id));
    return unsubscribe;
  }, [refreshProducts, user?.id]);

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.location.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "All" || p.category === categoryFilter;
    
    const matchMinPrice = minPrice === "" || p.pricePerUnit >= Number(minPrice);
    const matchMaxPrice = maxPrice === "" || p.pricePerUnit <= Number(maxPrice);
    const matchMinQty = minQuantity === "" || p.quantity >= Number(minQuantity);

    return matchSearch && matchCategory && matchMinPrice && matchMaxPrice && matchMinQty;
  });

  useEffect(() => {
    if (!user || products.length === 0) return;
    
    const timer = setTimeout(() => {
      toast.info(t("farmerMarket.toast.newInquiry", "New Inquiry Received!"), {
        description: t("farmerMarket.toast.newInquiryDescription", "A buyer is interested in one of your storage listings."),
      });
    }, 15000);

    return () => clearTimeout(timer);
  }, [products.length, t, user]);

  useEffect(() => {
    if (!connectingBuyer || isConnectMessageCustom) return;

    const autoSelectedProducts = products.filter(
      (p) => p.status === "active" && p.quantity > 0 && selectedConnectProductIds.includes(p.id)
    );

    if (autoSelectedProducts.length === 0) {
      setConnectMessage(
        `Hello ${connectingBuyer.name}, I would like to connect with you regarding my available produce from storage.`
      );
      return;
    }

    const lines = autoSelectedProducts
      .map((p) => `- ${p.name}: ${p.quantity} ${p.unit} at ₹${p.pricePerUnit}/Kg (${p.quality})`)
      .join("\n");

    setConnectMessage(
      `Hello ${connectingBuyer.name}, I want to sell these products directly from my storage inventory:\n${lines}\nPlease let me know if you are interested.`
    );
  }, [connectingBuyer, isConnectMessageCustom, products, selectedConnectProductIds]);

  const filteredBuyers = mockBuyers.filter((b) => {
    const matchSearch = b.name.toLowerCase().includes(search.toLowerCase()) || b.location.toLowerCase().includes(search.toLowerCase());
    const matchType = buyerTypeFilter === "All" || b.type === buyerTypeFilter;
    return matchSearch && matchType;
  });

  const connectableProducts = products.filter((p) => p.status === "active" && p.quantity > 0);

  const selectedConnectProducts = connectableProducts.filter((p) =>
    selectedConnectProductIds.includes(p.id)
  );

  const buildConnectMessage = (buyerName: string, productList: Product[]) => {
    if (productList.length === 0) {
      return `Hello ${buyerName}, I would like to connect with you regarding my available produce from storage.`;
    }

    const productLines = productList
      .map(
        (p) => `- ${p.name}: ${p.quantity} ${p.unit} at ₹${p.pricePerUnit}/Kg (${p.quality})`
      )
      .join("\n");

    return `Hello ${buyerName}, I want to sell these products directly from my storage inventory:\n${productLines}\nPlease let me know if you are interested.`;
  };

  const stats = [
    { label: "Active Listings", value: products.filter((p) => p.status === "active").length, icon: Package, color: "text-primary" },
    { label: "Total Inquiries", value: products.reduce((s, p) => s + p.inquiries, 0), icon: MessageCircle, color: "text-secondary" },
    { label: "Connected Buyers", value: mockBuyers.length, icon: Users, color: "text-accent-foreground" },
    { label: "Revenue (est.)", value: "₹4.8L", icon: TrendingUp, color: "text-primary" },
  ];

  const handleDelete = (id: string) => {
    if (!user?.id) {
      toast.error(t("farmerMarket.toast.loginRequired", "Please sign in first."));
      return;
    }

    if (confirm(t("farmerMarket.confirmDelete", "Are you sure you want to delete this listing?"))) {
      const isCancelled = cancelStorageListing(id, user.id);
      if (!isCancelled) {
        toast.error(t("farmerMarket.toast.deleteFailed", "Could not delete this storage listing."));
        return;
      }
      refreshProducts(user.id);
      toast.success(t("farmerMarket.toast.deleted", "Listing deleted successfully"));
    }
  };

  const handleExportCSV = () => {
    const headers = ["ID", "Name", "Category", "Quantity", "Unit", "Price", "Location", "Quality", "Status", "Date"];
    const rows = products.map(p => [
      p.id, p.name, p.category, p.quantity, p.unit, p.pricePerUnit, `"${p.location}"`, p.quality, p.status, p.listedDate
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `my_listings_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success(t("farmerMarket.toast.exported", "Listing exported as CSV"));
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
    toast.info(t("farmerMarket.toast.calling", "Initiating call to {{phone}}", { phone }));
  };

  const handleMessage = (buyerName: string) => {
    toast.info(t("farmerMarket.toast.messageSent", "Message feature coming soon!"), {
      description: t("farmerMarket.toast.messageDescription", "You will be able to message {{name}} directly.", { name: buyerName }),
    });
  };

  const handleConnect = (buyer: Buyer) => {
    if (connectableProducts.length === 0) {
      toast.error(
        t(
          "farmerMarket.connect.noActiveListings",
          "You have no active listings to offer. First create listings from the Storage page."
        )
      );
      return;
    }

    setConnectingBuyer(buyer);
    setSelectedConnectProductIds([]);
    setIsConnectMessageCustom(false);
    setConnectMessage(buildConnectMessage(buyer.name, []));
  };

  const handleToggleConnectProduct = (productId: string) => {
    setSelectedConnectProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSendConnectMessage = () => {
    if (!connectingBuyer) return;

    if (selectedConnectProducts.length === 0) {
      toast.error(
        t(
          "farmerMarket.connect.selectAtLeastOne",
          "Select at least one product before connecting with a buyer."
        )
      );
      return;
    }

    toast.success(
      t("farmerMarket.toast.productsShared", "Shared {{count}} products with {{name}}", {
        count: selectedConnectProducts.length,
        name: connectingBuyer.name,
      })
    );
    setConnectingBuyer(null);
    setSelectedConnectProductIds([]);
    setIsConnectMessageCustom(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">{t("farmerMarket.title", "Farmer-to-Market")}</h1>
          <p className="text-muted-foreground text-sm">{t("farmerMarket.subtitle", "Sell directly from your active storage inventory and connect with buyers")}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV} className="gap-2">
            <Download className="w-4 h-4" /> {t("farmerMarket.actions.exportCsv", "Export CSV")}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-lg font-bold text-foreground">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="listings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="listings">{t("farmerMarket.tabs.myListings", "My Listings")}</TabsTrigger>
          <TabsTrigger value="buyers">{t("farmerMarket.tabs.findBuyers", "Find Buyers")}</TabsTrigger>
        </TabsList>

        {/* --- Listings Tab --- */}
        <TabsContent value="listings" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder={t("farmerMarket.searchProducts", "Search products or locations...")} className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Button 
              variant="outline" 
              className={`gap-2 ${showAdvancedFilters ? "bg-primary/10 border-primary" : ""}`}
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <SlidersHorizontal className="w-4 h-4" /> {t("farmerMarket.filters", "Filters")}
            </Button>
            <div className="flex gap-2 flex-wrap">
              {categories.map((c) => (
                <Button key={c} variant={categoryFilter === c ? "default" : "outline"} size="sm" onClick={() => setCategoryFilter(c)} className="gap-1.5">
                  {categoryIcons[c]} {c}
                </Button>
              ))}
            </div>
          </div>

          {/* Advanced Filter Panel */}
          <AnimatePresence>
            {showAdvancedFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 border rounded-xl bg-muted/30 grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Min Price (₹)</Label>
                    <Input type="number" placeholder="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Max Price (₹)</Label>
                    <Input type="number" placeholder="No limit" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Min Quantity</Label>
                    <Input type="number" placeholder="0" value={minQuantity} onChange={(e) => setMinQuantity(e.target.value)} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => {
                const status = statusConfig[product.status];
                return (
                  <motion.div key={product.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                    <Card className="hover:shadow-md transition-shadow h-full">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                              {product.image.startsWith("data:") ? (
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-3xl">{product.image}</span>
                              )}
                            </div>
                            <div>
                              <CardTitle className="text-base">{product.name}</CardTitle>
                              <CardDescription className="flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3" /> {product.location}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant={status.variant} className="gap-1 text-xs">
                              <status.icon className="w-3 h-3" /> {status.label}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground text-xs">Quantity</p>
                            <p className="font-medium text-foreground">{product.quantity} {product.unit}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Price</p>
                            <p className="font-medium text-foreground flex items-center gap-0.5">
                              <IndianRupee className="w-3 h-3" />{product.pricePerUnit.toLocaleString()}/Kg
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Quality</p>
                            <p className="font-medium text-foreground">{product.quality}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Inquiries</p>
                            <p className="font-medium text-foreground">{product.inquiries}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => setViewingProduct(product)}>
                            <Eye className="w-3.5 h-3.5" /> View
                          </Button>
                          <Button variant="secondary" size="sm" className="flex-1 gap-1" onClick={() => setInquiryProduct(product)}>
                            <MessageCircle className="w-3.5 h-3.5" /> Inquiries
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
          {filteredProducts.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>{t("farmerMarket.noProducts", "No storage-based listings found. Create listings from the Storage page.")}</p>
            </div>
          )}
        </TabsContent>

        {/* --- Buyers Tab --- */}
        <TabsContent value="buyers" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder={t("farmerMarket.searchBuyers", "Search buyers...")} className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={buyerTypeFilter} onValueChange={setBuyerTypeFilter}>
              <SelectTrigger className="w-40"><Filter className="w-4 h-4 mr-2" /><SelectValue /></SelectTrigger>
              <SelectContent>
                {["All", "Wholesaler", "Retailer", "Exporter", "Distributor"].map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredBuyers.map((buyer) => (
                <motion.div key={buyer.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                  <Card className="hover:shadow-md transition-shadow h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base">{buyer.name}</CardTitle>
                            {buyer.verified && (
                              <Badge variant="default" className="text-[10px] px-1.5 py-0 gap-0.5">
                                <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                              </Badge>
                            )}
                          </div>
                          <CardDescription className="flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" /> {buyer.location}
                          </CardDescription>
                        </div>
                        <Badge variant="outline">{buyer.type}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">Rating</p>
                          <p className="font-medium text-foreground flex items-center gap-1"><Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" /> {buyer.rating}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Deals Done</p>
                          <p className="font-medium text-foreground">{buyer.totalDeals}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">Interested In</p>
                        <div className="flex flex-wrap gap-1">
                          {buyer.interestedIn.map((cat) => (
                            <Badge key={cat} variant="secondary" className="text-[10px]">{cat}</Badge>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">Active {buyer.lastActive}</p>
                      <div className="flex gap-2 pt-1">
                        <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => setSelectedBuyer(buyer)}><Eye className="w-3.5 h-3.5" /> {t("farmerMarket.actions.profile", "Profile")}</Button>
                        <Button size="sm" className="flex-1 gap-1" onClick={() => handleConnect(buyer)} disabled={connectableProducts.length === 0}><Handshake className="w-3.5 h-3.5" /> {t("farmerMarket.actions.connect", "Connect")}</Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </TabsContent>
      </Tabs>

      {/* Product View Dialog */}
      <Dialog open={!!viewingProduct} onOpenChange={() => setViewingProduct(null)}>
        <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
          {viewingProduct && (
            <>
              <DialogHeader>
                <DialogTitle>{viewingProduct.name}</DialogTitle>
                <DialogDescription className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {viewingProduct.location}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="w-full aspect-video rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                  {viewingProduct.image.startsWith("data:") ? (
                    <img src={viewingProduct.image} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-6xl">{viewingProduct.image}</span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Available</p>
                    <p className="text-lg font-bold">{viewingProduct.quantity} {viewingProduct.unit}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Price</p>
                    <p className="text-lg font-bold">₹{viewingProduct.pricePerUnit.toLocaleString()}/Kg</p>
                  </div>
                </div>
                <div className="p-3 border rounded-lg bg-muted/30 text-xs text-muted-foreground">
                  {t("farmerMarket.storageSource", "This listing was created from your storage inventory.")}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Quality</span>
                    <span className="font-medium">{viewingProduct.quality}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-medium">{viewingProduct.category}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Listed On</span>
                    <span className="font-medium">{viewingProduct.listedDate}</span>
                  </div>
                </div>
                {viewingProduct.description && (
                  <div className="p-3 border rounded-lg bg-muted/30">
                    <p className="text-sm italic">{viewingProduct.description}</p>
                  </div>
                )}
                <div className="space-y-2 pt-2">
                  <Button variant="destructive" className="w-full gap-2" onClick={() => {
                    setViewingProduct(null);
                    handleDelete(viewingProduct.id);
                  }}>
                    <Trash2 className="w-4 h-4" /> Delete
                  </Button>
                  <DialogClose asChild>
                    <Button variant="ghost" className="w-full">{t("farmerMarket.actions.close", "Close")}</Button>
                  </DialogClose>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Inquiries Chat Simulation Dialog */}
      <Dialog open={!!inquiryProduct} onOpenChange={() => setInquiryProduct(null)}>
        <DialogContent className="w-[95vw] sm:max-w-md h-[80vh] sm:h-[500px] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              Inquiries: {inquiryProduct?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">B1</div>
              <div className="bg-muted p-3 rounded-2xl rounded-tl-none text-sm">
                Is the price negotiable for a bulk order of 200 quintals?
              </div>
            </div>
            <div className="flex gap-3 flex-row-reverse">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground shrink-0 text-xs font-bold">YOU</div>
              <div className="bg-primary text-primary-foreground p-3 rounded-2xl rounded-tr-none text-sm">
                Yes, we can discuss a discount for that volume.
              </div>
            </div>
          </div>
          <div className="p-4 border-t flex gap-2">
            <Input placeholder={t("farmerMarket.typeMessage", "Type a message...")} />
            <Button size="icon"><Send className="w-4 h-4" /></Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Buyer Connect Dialog */}
      <Dialog open={!!connectingBuyer} onOpenChange={() => setConnectingBuyer(null)}>
        <DialogContent className="w-[95vw] sm:max-w-md h-[80vh] sm:h-[500px] flex flex-col p-0 overflow-hidden">
          {connectingBuyer && (
            <>
              <DialogHeader className="p-6 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <DialogTitle>Connect with {connectingBuyer.name}</DialogTitle>
                    <DialogDescription className="text-xs">
                      {connectingBuyer.type} • {connectingBuyer.location} • {connectingBuyer.rating} ★
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10">
                <div className="bg-muted p-3 rounded-lg text-xs text-muted-foreground italic border">
                  Initiating direct chat. Verified buyers usually respond within 2-4 hours.
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-foreground">
                    {t("farmerMarket.connect.chooseProducts", "Choose products to offer")}
                  </p>
                  <div className="max-h-44 overflow-y-auto space-y-2 pr-1">
                    {connectableProducts.map((product) => {
                      const selected = selectedConnectProductIds.includes(product.id);
                      return (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => handleToggleConnectProduct(product.id)}
                          className={`w-full rounded-lg border p-2 text-left transition-colors ${selected ? "border-primary bg-primary/10" : "border-border bg-background hover:border-primary/40"}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium text-foreground">{product.name}</p>
                            {selected && <CheckCircle2 className="w-4 h-4 text-primary" />}
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            {product.quantity} {product.unit} • ₹{product.pricePerUnit}/Kg • {product.quality}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {selectedConnectProducts.length > 0
                      ? t("farmerMarket.connect.selectedCount", "{{count}} products selected", { count: selectedConnectProducts.length })
                      : t("farmerMarket.connect.selectHint", "Select one or more products")}
                  </p>
                </div>
              </div>
              <div className="p-4 border-t bg-background space-y-2">
                <Textarea
                  placeholder={t("farmerMarket.typeMessage", "Type your message...")}
                  value={connectMessage}
                  onChange={(e) => {
                    setIsConnectMessageCustom(true);
                    setConnectMessage(e.target.value);
                  }}
                  rows={4}
                />
                <div className="flex justify-end">
                  <Button size="sm" className="gap-2" onClick={handleSendConnectMessage}>
                    {t("farmerMarket.actions.sendOffer", "Send Offer")} <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Buyer Profile Dialog */}
      <Dialog open={!!selectedBuyer} onOpenChange={() => setSelectedBuyer(null)}>
        <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
          {selectedBuyer && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <DialogTitle>{selectedBuyer.name}</DialogTitle>
                  {selectedBuyer.verified && (
                    <Badge variant="default" className="text-[10px] px-1.5 py-0 gap-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                    </Badge>
                  )}
                </div>
                <DialogDescription>{selectedBuyer.type} • {selectedBuyer.location}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-foreground flex items-center justify-center gap-1"><Star className="w-5 h-5 text-yellow-500 fill-yellow-500" /> {selectedBuyer.rating}</p>
                    <p className="text-xs text-muted-foreground">Rating</p>
                  </div>
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-foreground">{selectedBuyer.totalDeals}</p>
                    <p className="text-xs text-muted-foreground">Deals Completed</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Interested Categories</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedBuyer.interestedIn.map((cat) => (
                      <Badge key={cat} variant="secondary" className="gap-1">{categoryIcons[cat]} {cat}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1 gap-2" onClick={() => handleCall(selectedBuyer.phone)}>
                    <Phone className="w-4 h-4" /> {t("farmerMarket.actions.callBuyer", "Call Buyer")}
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2" onClick={() => handleMessage(selectedBuyer.name)}>
                    <MessageCircle className="w-4 h-4" /> {t("farmerMarket.actions.message", "Message")}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
