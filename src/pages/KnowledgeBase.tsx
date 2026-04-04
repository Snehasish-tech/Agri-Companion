import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import {
  Search, BookOpen, PlayCircle, FileText, Sprout, Bug, Droplets,
  Sun, Tractor, Leaf, ChevronRight, Clock, Eye, ThumbsUp,
} from "lucide-react";

const categories = [
  { id: "all", labelKey: "knowledgeBase.categories.all", fallback: "All" },
  { id: "Crop Management", labelKey: "knowledgeBase.categories.cropManagement", fallback: "Crop Management" },
  { id: "Pest Control", labelKey: "knowledgeBase.categories.pestControl", fallback: "Pest Control" },
  { id: "Irrigation", labelKey: "knowledgeBase.categories.irrigation", fallback: "Irrigation" },
  { id: "Soil Health", labelKey: "knowledgeBase.categories.soilHealth", fallback: "Soil Health" },
  { id: "Equipment", labelKey: "knowledgeBase.categories.equipment", fallback: "Equipment" },
  { id: "Organic Farming", labelKey: "knowledgeBase.categories.organicFarming", fallback: "Organic Farming" },
];

const articles = [
  { id: 1, title: "Complete Guide to Wheat Cultivation in India", category: "Crop Management", type: "guide", readTime: "12 min", views: 2340, likes: 187, icon: Sprout, tags: ["wheat", "rabi", "cultivation"], excerpt: "Learn best practices for wheat farming from seed selection to harvesting techniques." },
  { id: 2, title: "Identifying and Managing Common Rice Pests", category: "Pest Control", type: "article", readTime: "8 min", views: 1890, likes: 145, icon: Bug, tags: ["rice", "pests", "IPM"], excerpt: "A comprehensive guide to identifying rice pests and implementing integrated pest management." },
  { id: 3, title: "Drip Irrigation Setup for Small Farms", category: "Irrigation", type: "tutorial", readTime: "15 min", views: 3120, likes: 256, icon: Droplets, tags: ["drip", "water-saving", "setup"], excerpt: "Step-by-step tutorial for installing cost-effective drip irrigation on small holdings." },
  { id: 4, title: "Understanding Soil pH and Nutrient Management", category: "Soil Health", type: "guide", readTime: "10 min", views: 1650, likes: 132, icon: Leaf, tags: ["soil", "pH", "nutrients"], excerpt: "How soil pH affects crop growth and practical methods for soil amendment." },
  { id: 5, title: "Tractor Maintenance: Seasonal Checklist", category: "Equipment", type: "article", readTime: "6 min", views: 980, likes: 89, icon: Tractor, tags: ["tractor", "maintenance"], excerpt: "Keep your tractor running efficiently with this seasonal maintenance checklist." },
  { id: 6, title: "Getting Started with Organic Farming", category: "Organic Farming", type: "guide", readTime: "20 min", views: 4200, likes: 378, icon: Sun, tags: ["organic", "certification", "natural"], excerpt: "Everything you need to know about transitioning to organic farming practices." },
  { id: 7, title: "Video: Pruning Techniques for Fruit Trees", category: "Crop Management", type: "video", readTime: "18 min", views: 5600, likes: 420, icon: Sprout, tags: ["pruning", "fruits", "video"], excerpt: "Watch expert demonstrations of proper pruning techniques for mango, guava, and citrus trees." },
  { id: 8, title: "Natural Pest Repellents You Can Make at Home", category: "Pest Control", type: "tutorial", readTime: "7 min", views: 2800, likes: 210, icon: Bug, tags: ["natural", "DIY", "organic"], excerpt: "Create effective pest repellents using neem, garlic, and other natural ingredients." },
  { id: 9, title: "Rainwater Harvesting for Agriculture", category: "Irrigation", type: "guide", readTime: "14 min", views: 1920, likes: 165, icon: Droplets, tags: ["rainwater", "harvesting", "conservation"], excerpt: "Design and implement rainwater harvesting systems to supplement irrigation needs." },
];

const typeIcon = { guide: BookOpen, tutorial: FileText, article: FileText, video: PlayCircle };

export default function KnowledgeBase() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const getCategoryLabel = (categoryId: string) => {
    const match = categories.find((cat) => cat.id === categoryId);
    if (!match) return categoryId;
    return t(match.labelKey, { defaultValue: match.fallback });
  };

  const filtered = articles.filter((a) => {
    const matchesSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.tags.some((t) => t.includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || a.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="pt-4"
      >
        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-foreground flex items-center gap-2">
          📚 {t("knowledgeBase.title", { defaultValue: "Learning Center" })}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-2">{t("knowledgeBase.subtitle", { defaultValue: "Expand your farming knowledge with expert guides and tutorials" })}</p>
      </motion.div>

      {/* Search & Filter */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder={t("knowledgeBase.searchPlaceholder", { defaultValue: "Search articles, guides..." })} 
            className="pl-9 h-11 border border-border/50 focus:border-primary/50 bg-card/50" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.03 }}
            >
              <Button 
                variant={selectedCategory === cat.id ? "default" : "outline"} 
                size="sm"
                className={selectedCategory === cat.id ? "bg-primary text-primary-foreground" : "border-border/50"}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {t(cat.labelKey, { defaultValue: cat.fallback })}
              </Button>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{filtered.length} {filtered.length === 1 ? "article" : "articles"} found</span>
          {(search || selectedCategory !== "all") && (
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => { setSearch(""); setSelectedCategory("all"); }}>
              Clear filters
            </Button>
          )}
        </div>
      </motion.div>

      {/* Articles Grid */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ delay: 0.2 }}
      >
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-muted/20 rounded-lg border border-border/30"
            >
              <motion.div 
                animate={{ y: [0, -8, 0] }} 
                transition={{ duration: 3, repeat: Infinity }}
                className="mb-4"
              >
                <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/40" />
              </motion.div>
              <p className="text-base font-medium text-foreground">{t("knowledgeBase.noResults", { defaultValue: "No articles found" })}</p>
              <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or category filters</p>
              <Button variant="outline" size="sm" className="mt-4 text-xs" onClick={() => { setSearch(""); setSelectedCategory("all"); }}>
                Reset Filters
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-3">
              {filtered.map((article, i) => {
                const TypeIcon = typeIcon[article.type as keyof typeof typeIcon] || FileText;
                const categoryColors: Record<string, { bg: string; text: string }> = {
                  "Crop Management": { bg: "bg-amber-50 dark:bg-amber-950/30", text: "text-amber-600" },
                  "Pest Control": { bg: "bg-red-50 dark:bg-red-950/30", text: "text-red-600" },
                  "Irrigation": { bg: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-600" },
                  "Soil Health": { bg: "bg-green-50 dark:bg-green-950/30", text: "text-green-600" },
                  "Equipment": { bg: "bg-slate-50 dark:bg-slate-950/30", text: "text-slate-600" },
                  "Organic Farming": { bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-600" },
                };
                const colors = categoryColors[article.category] || { bg: "bg-gray-50 dark:bg-gray-950/30", text: "text-gray-600" };

                return (
                  <motion.div 
                    key={article.id} 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0 }} 
                    transition={{ delay: i * 0.02 }}
                    className="group"
                  >
                    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg border border-border/50 h-full hover:border-border cursor-pointer">
                      <CardContent className="p-5 flex gap-4 h-full">
                        {/* Icon */}
                        <div className={`w-14 h-14 rounded-lg ${colors.bg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                          <article.icon className={`w-6 h-6 ${colors.text}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 flex flex-col">
                          <div className="flex items-center gap-2 mb-2 flex-wrap gap-y-1">
                            <Badge variant="secondary" className="text-[10px] gap-1 h-5 px-2">
                              <TypeIcon className="w-3 h-3" />
                              {t(`knowledgeBase.articleTypes.${article.type}`, { defaultValue: article.type })}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] h-5 px-2">{getCategoryLabel(article.category)}</Badge>
                          </div>
                          <h3 className="font-semibold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors line-clamp-2">
                            {article.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 line-clamp-2 flex-1">{article.excerpt}</p>
                          <div className="flex items-center gap-3 mt-3 text-[10px] sm:text-xs text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded">
                              <Clock className="w-3 h-3" />
                              {article.readTime}
                            </span>
                            <span className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded">
                              <Eye className="w-3 h-3" />
                              {(article.views / 1000).toFixed(1)}k
                            </span>
                            <span className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded">
                              <ThumbsUp className="w-3 h-3" />
                              {article.likes}
                            </span>
                          </div>
                        </div>

                        {/* Arrow Indicator */}
                        <motion.div 
                          className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center shrink-0 group-hover:bg-primary/20 group-hover:text-primary transition-colors mt-1"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </motion.div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
