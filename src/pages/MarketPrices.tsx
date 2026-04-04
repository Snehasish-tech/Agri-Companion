import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, TrendingUp, TrendingDown, MapPin, RefreshCw, GitCompareArrows } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface CropPrice {
  id: number;
  name: string;
  nameHi: string;
  emoji: string;
  price: number;
  unit: string;
  change24h: number;
  mandi: string;
  state: string;
  category: string;
  minPrice?: number;
  maxPrice?: number;
  arrivalDate?: string;
  history: { date: string; price: number }[];
}

interface VegetableMeta {
  name: string;
  nameHi: string;
  emoji: string;
  category: string;
}

interface StateWholesaleData {
  state: string;
  mandi: string;
  values: number[];
}

const vegetableCatalog: VegetableMeta[] = [
  { name: "Tomato", nameHi: "टमाटर", emoji: "🍅", category: "Vegetables" },
  { name: "Potato", nameHi: "आलू", emoji: "🥔", category: "Vegetables" },
  { name: "Onion Big", nameHi: "प्याज़", emoji: "🧅", category: "Vegetables" },
  { name: "Brinjal", nameHi: "बैंगन", emoji: "🍆", category: "Vegetables" },
  { name: "Cabbage", nameHi: "पत्तागोभी", emoji: "🥬", category: "Vegetables" },
  { name: "Cauliflower", nameHi: "फूलगोभी", emoji: "🥦", category: "Vegetables" },
  { name: "Capsicum", nameHi: "शिमला मिर्च", emoji: "🫑", category: "Vegetables" },
  { name: "Carrot", nameHi: "गाजर", emoji: "🥕", category: "Vegetables" },
  { name: "Bitter Gourd", nameHi: "करेला", emoji: "🥒", category: "Vegetables" },
  { name: "Bottle Gourd", nameHi: "लौकी", emoji: "🥬", category: "Vegetables" },
  { name: "Lady's Finger", nameHi: "भिंडी", emoji: "🌱", category: "Vegetables" },
  { name: "Green Chilli", nameHi: "हरी मिर्च", emoji: "🌶️", category: "Spices" },
  { name: "Cucumber", nameHi: "खीरा", emoji: "🥒", category: "Vegetables" },
  { name: "Radish", nameHi: "मूली", emoji: "🥕", category: "Vegetables" },
  { name: "Spinach", nameHi: "पालक", emoji: "🌿", category: "Vegetables" },
  { name: "Pumpkin", nameHi: "कद्दू", emoji: "🎃", category: "Vegetables" },
  { name: "Ridge Gourd", nameHi: "तोरई", emoji: "🥬", category: "Vegetables" },
  { name: "Snake Gourd", nameHi: "चिचिंडा", emoji: "🥒", category: "Vegetables" },
  { name: "Ginger", nameHi: "अदरक", emoji: "🫚", category: "Spices" },
  { name: "Garlic", nameHi: "लहसुन", emoji: "🧄", category: "Spices" },
];

const stateWholesaleData: StateWholesaleData[] = [
  { state: "Delhi", mandi: "Delhi (NCR)", values: [18, 18, 22, 36, 20, 34, 56, 29, 43, 27, 31, 66, 28, 32, 18, 24, 38, 31, 87, 134] },
  { state: "West Bengal", mandi: "Kolkata", values: [13, 16, 19, 25, 18, 28, 45, 24, 33, 24, 25, 50, 23, 25, 14, 20, 32, 26, 69, 110] },
  { state: "Maharashtra", mandi: "Mumbai", values: [17, 22, 20, 32, 19, 30, 50, 24, 35, 25, 34, 40, 27, 29, 10, 19, 39, 33, 75, 124] },
  { state: "Karnataka", mandi: "Bangalore", values: [21, 21, 23, 36, 25, 31, 57, 31, 45, 29, 34, 69, 30, 31, 15, 25, 39, 33, 93, 151] },
  { state: "Tamil Nadu", mandi: "Chennai", values: [30, 60, 80, 40, 20, 25, 60, 35, 110, 30, 60, 80, 30, 25, 20, 25, 40, 35, 90, 140] },
  { state: "Telangana", mandi: "Hyderabad", values: [20, 25, 22, 30, 22, 28, 55, 28, 40, 25, 30, 60, 25, 22, 15, 22, 35, 30, 80, 130] },
  { state: "Rajasthan", mandi: "Jaipur", values: [18, 20, 22, 28, 15, 25, 50, 30, 35, 20, 28, 55, 22, 18, 12, 18, 30, 28, 75, 120] },
  { state: "Gujarat", mandi: "Ahmedabad", values: [20, 18, 20, 30, 18, 28, 52, 26, 38, 22, 30, 50, 24, 22, 12, 20, 32, 28, 78, 122] },
  { state: "Punjab", mandi: "Ludhiana", values: [20, 15, 24, 30, 18, 30, 55, 28, 40, 22, 30, 60, 25, 20, 14, 20, 32, 28, 80, 120] },
  { state: "Uttar Pradesh", mandi: "Lucknow", values: [20, 16, 22, 28, 18, 28, 50, 26, 38, 22, 28, 55, 24, 20, 14, 20, 32, 28, 80, 118] },
  { state: "Bihar", mandi: "Patna", values: [18, 14, 20, 25, 16, 24, 45, 24, 32, 20, 26, 50, 20, 18, 12, 18, 28, 25, 70, 110] },
  { state: "Madhya Pradesh", mandi: "Bhopal", values: [18, 16, 20, 28, 16, 26, 48, 25, 35, 20, 28, 52, 22, 18, 12, 18, 30, 26, 75, 115] },
  { state: "Andhra Pradesh", mandi: "Vijayawada", values: [22, 28, 22, 30, 20, 28, 55, 30, 42, 24, 32, 65, 25, 22, 16, 22, 34, 30, 82, 132] },
  { state: "Kerala", mandi: "Kochi", values: [35, 50, 40, 45, 28, 40, 70, 40, 55, 30, 40, 80, 30, 28, 25, 28, 40, 35, 95, 160] },
  { state: "Haryana", mandi: "Gurgaon", values: [19, 16, 22, 30, 18, 30, 52, 28, 40, 22, 30, 60, 25, 20, 14, 20, 32, 28, 82, 125] },
  { state: "Odisha", mandi: "Bhubaneswar", values: [20, 18, 22, 28, 18, 26, 48, 26, 35, 22, 28, 55, 22, 20, 14, 20, 30, 26, 75, 115] },
  { state: "Assam", mandi: "Guwahati", values: [25, 22, 28, 30, 22, 30, 55, 30, 40, 28, 32, 65, 28, 24, 18, 24, 35, 30, 85, 120] },
  { state: "Chhattisgarh", mandi: "Raipur", values: [20, 18, 22, 28, 18, 26, 50, 26, 35, 22, 28, 55, 22, 20, 14, 18, 30, 26, 75, 115] },
  { state: "Jharkhand", mandi: "Ranchi", values: [22, 18, 22, 28, 18, 26, 50, 26, 36, 22, 28, 55, 22, 20, 15, 20, 30, 26, 75, 112] },
  { state: "Himachal Pradesh", mandi: "Shimla", values: [22, 20, 26, 32, 20, 30, 55, 30, 40, 25, 32, 60, 26, 22, 16, 22, 32, 28, 80, 125] },
];

const buildHistory = (basePrice: number, change: number): { date: string; price: number }[] => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const trend = change >= 0 ? 1 : -1;
  return days.map((day, i) => {
    const factor = 1 + trend * i * 0.01;
    const noise = 1 + ((i % 2 === 0 ? 1 : -1) * 0.006);
    return { date: day, price: Math.max(1, Math.round(basePrice * factor * noise)) };
  });
};

const getStableChange = (name: string, state: string): number => {
  const seed = `${name}-${state}`.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const value = ((seed % 140) - 60) / 10;
  return parseFloat(value.toFixed(1));
};

const mockCrops: CropPrice[] = stateWholesaleData.flatMap((stateInfo, stateIndex) =>
  vegetableCatalog.map((veg, vegIndex) => {
    const wholesale = stateInfo.values[vegIndex];
    const retailMin = Math.round(wholesale * 1.2);
    const retailMax = Math.round(wholesale * 1.5);
    const change24h = getStableChange(veg.name, stateInfo.state);

    return {
      id: stateIndex * 100 + vegIndex + 1,
      name: veg.name,
      nameHi: veg.nameHi,
      emoji: veg.emoji,
      price: wholesale,
      unit: "kg",
      change24h,
      mandi: stateInfo.mandi,
      state: stateInfo.state,
      category: veg.category,
      minPrice: retailMin,
      maxPrice: retailMax,
      arrivalDate: "2026-04-04",
      history: buildHistory(wholesale, change24h),
    };
  })
);

export default function MarketPrices() {
  const { t } = useTranslation();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedCrop, setSelectedCrop] = useState<CropPrice | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "price" | "change">("change");
  const [stateFilter, setStateFilter] = useState("West Bengal");
  const [liveCrops, setLiveCrops] = useState<CropPrice[]>(mockCrops);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const [compareVegetable, setCompareVegetable] = useState("Tomato");
  const [compareStateA, setCompareStateA] = useState("West Bengal");
  const [compareStateB, setCompareStateB] = useState("Delhi");

  const categories = useMemo(() => ["All", ...new Set(liveCrops.map((c) => c.category))], [liveCrops]);
  const states = useMemo(() => ["All", ...new Set(liveCrops.map((c) => c.state))], [liveCrops]);

  const getCategoryLabel = (cat: string) => {
    if (cat === "All") return t("market.categories.all", { defaultValue: "All" });
    if (cat === "Vegetables") return t("market.categories.vegetables", { defaultValue: "Vegetables" });
    if (cat === "Cereals") return t("market.categories.cereals", { defaultValue: "Cereals" });
    if (cat === "Oilseeds") return t("market.categories.oilseeds", { defaultValue: "Oilseeds" });
    if (cat === "Pulses") return t("market.categories.pulses", { defaultValue: "Pulses" });
    if (cat === "Spices") return t("market.categories.spices", { defaultValue: "Spices" });
    return cat;
  };

  const vegetableOptions = useMemo(() => {
    return Array.from(new Set(liveCrops.map((c) => c.name))).sort((a, b) => a.localeCompare(b));
  }, [liveCrops]);

  const filtered = useMemo(() => {
    const result = liveCrops.filter((c) => {
      const searchLower = search.toLowerCase();
      const matchSearch =
        c.name.toLowerCase().includes(searchLower) ||
        c.nameHi.includes(search) ||
        c.state.toLowerCase().includes(searchLower) ||
        c.mandi.toLowerCase().includes(searchLower);
      const matchCat = category === "All" || c.category === category;
      const matchState = stateFilter === "All" || c.state === stateFilter;
      return matchSearch && matchCat && matchState;
    });

    result.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "price") return b.price - a.price;
      return Math.abs(b.change24h) - Math.abs(a.change24h);
    });

    return result;
  }, [liveCrops, search, category, sortBy, stateFilter]);

  const topGainers = useMemo(() => {
    return [...filtered].sort((a, b) => b.change24h - a.change24h).slice(0, 5);
  }, [filtered]);

  const comparisonRows = useMemo(() => {
    return liveCrops
      .filter((item) => item.name === compareVegetable)
      .sort((a, b) => a.price - b.price);
  }, [liveCrops, compareVegetable]);

  const compareA = useMemo(() => {
    return comparisonRows.find((row) => row.state === compareStateA) || null;
  }, [comparisonRows, compareStateA]);

  const compareB = useMemo(() => {
    return comparisonRows.find((row) => row.state === compareStateB) || null;
  }, [comparisonRows, compareStateB]);

  const compareGap = compareA && compareB ? compareA.price - compareB.price : 0;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLiveCrops([...mockCrops]);
      setLastUpdated(new Date());
      setIsRefreshing(false);
      toast.success("Market prices refreshed");
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">
            {t("market.title", { defaultValue: "Market Prices" })}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("market.subtitleDemo", { defaultValue: "State-wise vegetable dataset with wholesale and retail range comparison" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {t("market.updatedAt", {
              defaultValue: "Updated {{time}}",
              time: lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
            })}
          </Badge>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            {t("market.refresh", { defaultValue: "Refresh" })}
          </Button>
        </div>
      </div>

      <motion.div
        animate={
          isRefreshing
            ? { opacity: [1, 0.94, 1], y: [0, 2, 0], scale: [1, 0.998, 1] }
            : { opacity: 1, y: 0, scale: 1 }
        }
        transition={{ duration: 0.45, ease: "easeInOut" }}
        className="space-y-6"
      >

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{t("market.overviewTitle", { defaultValue: "Price Overview" })}</CardTitle>
              <div className="flex gap-2 flex-wrap">
                {categories.slice(1).map((cat) => (
                  <Button
                    key={cat}
                    variant={category === cat ? "default" : "ghost"}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setCategory(category === cat ? "All" : cat)}
                  >
                    {getCategoryLabel(cat)}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filtered.slice(0, 12)}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" tickFormatter={(value) => `₹${value}`} />
                  <Tooltip
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, t("market.wholesaleLabel", { defaultValue: "Wholesale" })]}
                    contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #e5e7eb" }}
                  />
                  <Area type="monotone" dataKey="price" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              {t("market.topMovers", { defaultValue: "Top Movers" })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topGainers.map((crop, i) => (
              <motion.div
                key={crop.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                onClick={() => setSelectedCrop(crop)}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xl">{crop.emoji}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{crop.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{crop.state}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">₹{crop.price}</p>
                  <p className={`text-xs font-medium ${crop.change24h >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {crop.change24h > 0 ? "+" : ""}
                    {crop.change24h}%
                  </p>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border border-primary/20 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <GitCompareArrows className="w-4 h-4 text-primary" />
            {t("market.compare.title", { defaultValue: "State-wise Vegetable Compare" })}
          </CardTitle>
          <CardDescription>
            {t("market.compare.description", { defaultValue: "Compare wholesale and retail range of a single vegetable across states." })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Select value={compareVegetable} onValueChange={setCompareVegetable}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder={t("market.compare.selectVegetable", { defaultValue: "Select Vegetable" })} />
              </SelectTrigger>
              <SelectContent>
                {vegetableOptions.map((veg) => (
                  <SelectItem key={veg} value={veg}>
                    {veg}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={compareStateA} onValueChange={setCompareStateA}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder={t("market.compare.stateA", { defaultValue: "State A" })} />
              </SelectTrigger>
              <SelectContent>
                {states.filter((s) => s !== "All").map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={compareStateB} onValueChange={setCompareStateB}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder={t("market.compare.stateB", { defaultValue: "State B" })} />
              </SelectTrigger>
              <SelectContent>
                {states.filter((s) => s !== "All").map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {compareA && compareB && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Card className="border-green-200 bg-green-50/40">
                <CardContent className="p-4">
                  <p className="text-sm font-semibold text-foreground">{compareA.state}</p>
                  <p className="text-xs text-muted-foreground mb-2">{compareA.mandi}</p>
                  <p className="text-xl font-bold text-foreground">₹{compareA.price}/kg</p>
                  <p className="text-xs text-muted-foreground">
                    {t("market.retailLabel", { defaultValue: "Retail" })}: ₹{compareA.minPrice} - ₹{compareA.maxPrice}/kg
                  </p>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50/40">
                <CardContent className="p-4">
                  <p className="text-sm font-semibold text-foreground">{compareB.state}</p>
                  <p className="text-xs text-muted-foreground mb-2">{compareB.mandi}</p>
                  <p className="text-xl font-bold text-foreground">₹{compareB.price}/kg</p>
                  <p className="text-xs text-muted-foreground">
                    {t("market.retailLabel", { defaultValue: "Retail" })}: ₹{compareB.minPrice} - ₹{compareB.maxPrice}/kg
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {compareA && compareB && (
            <div>
              <Badge variant="secondary" className="text-xs">
                {compareGap >= 0
                  ? t("market.compare.higherText", {
                      defaultValue: "{{higherState}} is ₹{{amount}} higher than {{lowerState}}",
                      higherState: compareA.state,
                      amount: Math.abs(compareGap),
                      lowerState: compareB.state,
                    })
                  : t("market.compare.higherText", {
                      defaultValue: "{{higherState}} is ₹{{amount}} higher than {{lowerState}}",
                      higherState: compareB.state,
                      amount: Math.abs(compareGap),
                      lowerState: compareA.state,
                    })}
              </Badge>
            </div>
          )}

          <div className="max-h-[320px] overflow-y-auto pr-1 space-y-2">
            {comparisonRows.map((row) => (
              <div
                key={`${row.name}-${row.state}`}
                className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{row.state}</p>
                  <p className="text-xs text-muted-foreground">{row.mandi}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">₹{row.price}/kg</p>
                  <p className="text-xs text-muted-foreground">{t("market.retailLabel", { defaultValue: "Retail" })} ₹{row.minPrice} - ₹{row.maxPrice}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <CardTitle className="text-base">{t("market.allCommodities", { defaultValue: "All Commodities" })}</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t("market.searchPlaceholder", { defaultValue: "Search by crop, state, or mandi..." })}
                  className="pl-9 h-9 w-full sm:w-[240px]"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <Select value={stateFilter} onValueChange={setStateFilter}>
                <SelectTrigger className="w-full sm:w-[160px] h-9">
                  <SelectValue placeholder={t("market.allStates", { defaultValue: "All States" })} />
                </SelectTrigger>
                <SelectContent>
                  {states.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state === "All" ? t("market.categories.all", { defaultValue: "All" }) : state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(v) => setSortBy(v as "name" | "price" | "change")}>
                <SelectTrigger className="w-full sm:w-[130px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="change">{t("market.sort.trending", { defaultValue: "Trending" })}</SelectItem>
                  <SelectItem value="price">{t("market.sort.price", { defaultValue: "Price" })}</SelectItem>
                  <SelectItem value="name">{t("market.sort.name", { defaultValue: "Name" })}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((crop, i) => (
              <motion.div
                key={crop.id}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                transition={{ delay: i * 0.02 }}
              >
                <Card
                  className="cursor-pointer h-full bg-gradient-to-br from-background to-muted/30 border-2 border-primary/20 shadow-sm hover:shadow-xl hover:border-primary/50 transition-all duration-300 rounded-xl overflow-hidden"
                  onClick={() => setSelectedCrop(crop)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-3xl drop-shadow-md">{crop.emoji}</span>
                      <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border border-primary/20">
                        {getCategoryLabel(crop.category)}
                      </Badge>
                    </div>

                    <h3 className="font-semibold text-foreground mb-1">{crop.name}</h3>
                    <p className="text-xs text-muted-foreground mb-1">{crop.nameHi}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-3 truncate">
                      <MapPin className="w-3 h-3 shrink-0" />
                      {crop.mandi}, {crop.state}
                    </p>

                    <div className="flex items-end justify-between pt-3 border-t border-border/50">
                      <div>
                        <p className="text-xs text-muted-foreground">{t("market.wholesaleLabel", { defaultValue: "Wholesale" })}</p>
                        <p className="text-xl font-bold text-foreground">₹{crop.price}</p>
                        <p className="text-xs text-muted-foreground">{t("market.perUnit", { defaultValue: "per {{unit}}", unit: crop.unit })}</p>
                      </div>
                      <div
                        className={`flex items-center gap-1 text-sm font-semibold px-2.5 py-1.5 rounded-lg border-2 ${
                          crop.change24h > 0
                            ? "bg-green-500/10 text-green-700 border-green-500/30"
                            : crop.change24h < 0
                              ? "bg-red-500/10 text-red-700 border-red-500/30"
                              : "bg-gray-500/10 text-gray-700 border-gray-500/20"
                        }`}
                      >
                        {crop.change24h > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {crop.change24h > 0 ? "+" : ""}
                        {crop.change24h}%
                      </div>
                    </div>

                    <p className="mt-2 text-[11px] text-muted-foreground">
                      {t("market.retailLabel", { defaultValue: "Retail" })}: ₹{crop.minPrice} - ₹{crop.maxPrice}/kg
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <Search className="w-12 h-12 text-muted-foreground/30 mb-3" />
              <p className="text-lg font-medium text-foreground">{t("market.empty.title", { defaultValue: "No crops found" })}</p>
              <p className="text-sm text-muted-foreground">{t("market.empty.subtitle", { defaultValue: "Try adjusting your search or filter" })}</p>
            </div>
          )}
        </CardContent>
      </Card>
      </motion.div>

      <Dialog open={!!selectedCrop} onOpenChange={() => setSelectedCrop(null)}>
        <DialogContent className="max-w-lg">
          {selectedCrop && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <span className="text-4xl">{selectedCrop.emoji}</span>
                  <div>
                    <p className="text-xl font-bold">{selectedCrop.name}</p>
                    <p className="text-sm text-muted-foreground font-normal">{selectedCrop.nameHi}</p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  {selectedCrop.mandi}, {selectedCrop.state}
                </div>

                <Card>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">{t("market.dialog.wholesalePrice", { defaultValue: "Wholesale Price" })}</p>
                        <p className="text-2xl font-bold text-foreground">₹{selectedCrop.price}</p>
                        <p className="text-xs text-muted-foreground">{t("market.perUnit", { defaultValue: "per {{unit}}", unit: selectedCrop.unit })}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{t("market.change24h", { defaultValue: "(24h)" })}</p>
                        <p className={`text-2xl font-bold ${selectedCrop.change24h > 0 ? "text-green-600" : "text-red-600"}`}>
                          {selectedCrop.change24h > 0 ? "+" : ""}
                          {selectedCrop.change24h}%
                        </p>
                        <p className="text-xs text-muted-foreground">{t("market.retailLabel", { defaultValue: "Retail" })}: ₹{selectedCrop.minPrice} - ₹{selectedCrop.maxPrice}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div>
                  <p className="text-sm font-medium mb-2">{t("market.dialog.priceTrend", { defaultValue: "Price Trend (Last 6 Days)" })}</p>
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={selectedCrop.history}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                        <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" tickFormatter={(v) => `₹${v}`} />
                        <Tooltip
                          formatter={(value: number) => [`₹${value}`, t("market.wholesaleLabel", { defaultValue: "Wholesale" })]}
                          contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #e5e7eb" }}
                        />
                        <Line
                          type="monotone"
                          dataKey="price"
                          stroke={selectedCrop.change24h >= 0 ? "#22c55e" : "#ef4444"}
                          strokeWidth={2}
                          dot={{ fill: selectedCrop.change24h >= 0 ? "#22c55e" : "#ef4444", r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Card>
                    <CardContent className="p-3 text-center">
                      <p className="text-xs text-muted-foreground">{t("market.dialog.retailMin", { defaultValue: "Retail Min" })}</p>
                      <p className="text-lg font-bold text-foreground">₹{selectedCrop.minPrice}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3 text-center">
                      <p className="text-xs text-muted-foreground">{t("market.dialog.retailMax", { defaultValue: "Retail Max" })}</p>
                      <p className="text-lg font-bold text-foreground">₹{selectedCrop.maxPrice}</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t">
                  <span>{t("market.dialog.category", { defaultValue: "Category" })}: {getCategoryLabel(selectedCrop.category)}</span>
                  <span>{t("market.dialog.unit", { defaultValue: "Unit" })}: {selectedCrop.unit}</span>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
