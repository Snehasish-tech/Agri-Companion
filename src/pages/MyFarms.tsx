import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import {
  Wheat, MapPin, Droplets, Thermometer, Plus, Pencil, Trash2,
  Sprout, Calendar, BarChart3, Leaf, Sun, TrendingUp, X, PlusCircle, Camera, Upload, 
  Building2, CloudSun, Droplet, Activity
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";

interface Farm {
  id: number;
  name: string;
  location: string;
  size: number;
  unit: string;
  soilType: string;
  irrigation: string;
  image?: string;
  crops: { name: string; status: string; plantedDate: string; expectedHarvest: string; health: string; image?: string }[];
}

const LEGACY_STORAGE_KEY = "agri_farms";

const buildUserFarmStorageKey = (userId: string) => `agri_farms_${userId}`;

const parseFarmsFromStorage = (raw: string | null): Farm[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const isLegacyDemoFarms = (farms: Farm[]) => {
  if (farms.length !== 3) return false;
  const names = farms.map((farm) => farm.name).sort();
  return (
    names.includes("Green Valley Farm") &&
    names.includes("Sunrise Fields") &&
    names.includes("Riverside Plot")
  );
};

const healthColor: Record<string, string> = { Healthy: "bg-green-500/10 text-green-700", Good: "bg-blue-500/10 text-blue-700", "Needs Attention": "bg-yellow-500/10 text-yellow-700" };
const statusColor: Record<string, string> = { Growing: "bg-primary/10 text-primary", Harvesting: "bg-green-500/10 text-green-700", Seedling: "bg-blue-500/10 text-blue-700" };

export default function MyFarms() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newFarm, setNewFarm] = useState({ name: "", location: "", size: "", unit: "Acres", soilType: "", irrigation: "", image: "", crops: [] as Farm['crops'] });

  // State for adding a new crop (used in both farm form and detail view)
  const [newCrop, setNewCrop] = useState({ name: "", status: "Growing", plantedDate: "", expectedHarvest: "", health: "Healthy", image: "" });

  const healthLabelMap: Record<string, string> = {
    Healthy: t("myFarms.health.healthy", { defaultValue: "Healthy" }),
    Good: t("myFarms.health.good", { defaultValue: "Good" }),
    "Needs Attention": t("myFarms.health.needsAttention", { defaultValue: "Needs Attention" }),
  };

  const statusLabelMap: Record<string, string> = {
    Growing: t("myFarms.status.growing", { defaultValue: "Growing" }),
    Harvesting: t("myFarms.status.harvesting", { defaultValue: "Harvesting" }),
    Seedling: t("myFarms.status.seedling", { defaultValue: "Seedling" }),
  };

  const farmFileInputRef = useRef<HTMLInputElement>(null);
  const cropFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user?.id) {
      setFarms([]);
      setIsHydrated(false);
      return;
    }

    const userStorageKey = buildUserFarmStorageKey(user.id);
    const userFarms = parseFarmsFromStorage(localStorage.getItem(userStorageKey));

    if (userFarms.length > 0) {
      setFarms(userFarms);
      setIsHydrated(true);
      return;
    }

    // Migrate only meaningful old local data; drop hardcoded demo farms.
    const legacyFarms = parseFarmsFromStorage(localStorage.getItem(LEGACY_STORAGE_KEY));
    if (legacyFarms.length > 0 && !isLegacyDemoFarms(legacyFarms)) {
      setFarms(legacyFarms);
      localStorage.setItem(userStorageKey, JSON.stringify(legacyFarms));
    } else {
      setFarms([]);
    }

    localStorage.removeItem(LEGACY_STORAGE_KEY);
    setIsHydrated(true);
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id || !isHydrated) return;
    localStorage.setItem(buildUserFarmStorageKey(user.id), JSON.stringify(farms));
  }, [farms, isHydrated, user?.id]);

  const totalArea = farms.reduce((sum, f) => sum + f.size, 0);
  const totalCrops = farms.reduce((sum, f) => sum + f.crops.length, 0);
  const averageCropsPerFarm = farms.length > 0 ? (totalCrops / farms.length).toFixed(1) : "0";

  // Calculate Health Distribution for Pie Chart
  const healthStats = useMemo(() => {
    const stats = [
      { name: "Healthy", value: 0, color: "#22c55e" },
      { name: "Good", value: 0, color: "#3b82f6" },
      { name: "Needs Attention", value: 0, color: "#eab308" },
      { name: "Other", value: 0, color: "#6b7280" },
    ];
    farms.forEach(f => f.crops.forEach(c => {
      const stat = stats.find(s => s.name === c.health);
      if (stat) {
        stat.value++;
      } else {
        const other = stats.find((s) => s.name === "Other");
        if (other) other.value++;
      }
    }));
    return stats.filter(s => s.value > 0);
  }, [farms]);

  const totalHealthTracked = useMemo(
    () => healthStats.reduce((sum, stat) => sum + stat.value, 0),
    [healthStats]
  );

  const healthScore = useMemo(() => {
    if (totalHealthTracked === 0) return 0;
    const getCount = (name: string) => healthStats.find((s) => s.name === name)?.value ?? 0;
    const weighted =
      getCount("Healthy") * 100 +
      getCount("Good") * 75 +
      getCount("Needs Attention") * 45 +
      getCount("Other") * 30;
    return Math.round(weighted / totalHealthTracked);
  }, [healthStats, totalHealthTracked]);

  const topAreaFarms = useMemo(
    () => [...farms].sort((a, b) => b.size - a.size).slice(0, 3),
    [farms]
  );

  const handleSaveFarm = () => {
    if (!newFarm.name || !newFarm.location) {
      toast.error(t("myFarms.toast.requiredFarmNameLocation", { defaultValue: "Farm name and location are required" }));
      return;
    }

    if (editingId) {
      setFarms(farms.map(f => f.id === editingId ? {
        ...f,
        name: newFarm.name,
        location: newFarm.location,
        size: parseFloat(newFarm.size) || 0,
        unit: newFarm.unit,
        soilType: newFarm.soilType,
        irrigation: newFarm.irrigation,
        image: newFarm.image,
        crops: newFarm.crops,
      } : f));
      toast.success(t("myFarms.toast.farmUpdated", { defaultValue: "Farm updated successfully" }));
    } else {
      setFarms([...farms, {
        id: Date.now(), name: newFarm.name, location: newFarm.location, image: newFarm.image,
        size: parseFloat(newFarm.size) || 0, unit: newFarm.unit, soilType: newFarm.soilType, irrigation: newFarm.irrigation, crops: newFarm.crops,
      }]);
      toast.success(t("myFarms.toast.farmAdded", { defaultValue: "New farm added successfully" }));
    }

    setNewFarm({ name: "", location: "", size: "", unit: "Acres", soilType: "", irrigation: "", image: "", crops: [] });
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleEdit = (farm: Farm) => {
    setEditingId(farm.id);
    setNewFarm({
      name: farm.name,
      location: farm.location,
      size: farm.size.toString(),
      unit: farm.unit,
      soilType: farm.soilType,
      irrigation: farm.irrigation,
      image: farm.image || "",
      crops: [...farm.crops]
    });
    setIsFormOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, target: 'farm' | 'crop') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (target === 'farm') {
          setNewFarm(prev => ({ ...prev, image: reader.result as string }));
        } else {
          setNewCrop(prev => ({ ...prev, image: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm(t("myFarms.confirm.deleteFarm", { defaultValue: "Are you sure you want to delete this farm profile? This action cannot be undone." }))) {
      setFarms(farms.filter((f) => f.id !== id));
      if (selectedFarm?.id === id) setSelectedFarm(null);
      toast.success(t("myFarms.toast.farmDeleted", { defaultValue: "Farm profile deleted" }));
    }
  };

  const handleAddCropToForm = () => {
    if (!newCrop.name.trim()) {
      toast.error(t("myFarms.toast.cropNameRequired", { defaultValue: "Crop name is required" }));
      return;
    }
    setNewFarm(prev => ({
      ...prev,
      crops: [...prev.crops, { ...newCrop }]
    }));
    setNewCrop({ name: "", status: "Growing", plantedDate: "", expectedHarvest: "", health: "Healthy", image: "" });
  };

  const handleRemoveCropFromForm = (index: number) => {
    setNewFarm(prev => ({
      ...prev,
      crops: prev.crops.filter((_, i) => i !== index)
    }));
  };

  const handleAddCropToExistingFarm = (farmId: number) => {
    if (!newCrop.name.trim()) {
      toast.error(t("myFarms.toast.validCropName", { defaultValue: "Please enter a valid crop name" }));
      return;
    }
    setFarms(prev => prev.map(f => {
      if (f.id === farmId) {
        const updatedFarm = { ...f, crops: [...f.crops, { ...newCrop }] };
        setSelectedFarm(updatedFarm); // Update detail view
        return updatedFarm;
      }
      return f;
    }));
    setNewCrop({ name: "", status: "Growing", plantedDate: "", expectedHarvest: "", health: "Healthy", image: "" });
    toast.success(t("myFarms.toast.cropAdded", { defaultValue: "Crop added to farm" }));
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-emerald-200/40 bg-gradient-to-br from-emerald-700 via-green-600 to-lime-500 p-6 sm:p-8 shadow-[0_20px_50px_-20px_rgba(21,128,61,0.65)]"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxLjUiLz48L2c+PC9nPjxyZWN0IHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==')] opacity-20" />
        <div className="absolute -top-16 -left-10 w-56 h-56 rounded-full bg-lime-300/25 blur-3xl" />
        <div className="absolute -bottom-16 right-24 w-56 h-56 rounded-full bg-emerald-200/20 blur-3xl" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-40 h-40 sm:w-64 sm:h-64 opacity-15">
          <Sprout className="w-full h-full text-white" />
        </div>
       
        <div className="relative z-10">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl sm:text-4xl font-heading font-bold text-white flex items-center gap-3 mb-2"
          >
            🌾 {t("myFarms.title", { defaultValue: "My Farms" })}
          </motion.h1>
          <p className="text-emerald-50/95 text-sm sm:text-base mb-6 max-w-2xl">{t("myFarms.subtitle", { defaultValue: "Manage your farm profiles, crops, and field details" })}</p>
          
          <div className="flex items-center gap-3 flex-wrap">
            {[
              { label: farms.length === 1 ? "Farm" : "Farms", value: farms.length, icon: Building2, chipClass: "border-emerald-200/40 bg-emerald-400/20", iconClass: "bg-emerald-100/25 text-emerald-50" },
              { label: totalCrops === 1 ? "Crop" : "Crops", value: totalCrops, icon: Sprout, chipClass: "border-sky-200/40 bg-sky-400/20", iconClass: "bg-sky-100/25 text-sky-50" },
              { label: "Acres", value: totalArea.toFixed(1), icon: MapPin, chipClass: "border-amber-200/40 bg-amber-400/20", iconClass: "bg-amber-100/25 text-amber-50" },
              { label: "Health", value: `${healthScore}%`, icon: TrendingUp, chipClass: "border-fuchsia-200/40 bg-fuchsia-400/20", iconClass: "bg-fuchsia-100/25 text-fuchsia-50" },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + idx * 0.05 }}
                className={`rounded-xl border backdrop-blur-md px-4 py-3 min-w-[128px] shadow-sm ${stat.chipClass}`}
              >
                <div className="flex items-center gap-2 text-white/95 mb-1">
                  <span className={`inline-flex h-5 w-5 items-center justify-center rounded-md ${stat.iconClass}`}>
                    <stat.icon className="w-3.5 h-3.5" />
                  </span>
                  <p className="text-[11px] uppercase tracking-wide font-medium">{stat.label}</p>
                </div>
                <p className="text-2xl font-bold text-white leading-none">{stat.value}</p>
              </motion.div>
            ))}
            
            <Dialog open={isFormOpen} onOpenChange={(open) => {
              setIsFormOpen(open);
              if (!open) {
                setEditingId(null);
                setNewFarm({ name: "", location: "", size: "", unit: "Acres", soilType: "", irrigation: "", image: "", crops: [] });
              }
            }}>
              <DialogTrigger asChild>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="ml-auto gap-2 bg-gradient-to-r from-white to-emerald-50 text-green-800 hover:from-white hover:to-green-100 px-6 py-2.5 rounded-xl font-semibold flex items-center shadow-[0_10px_25px_-10px_rgba(255,255,255,0.9)] hover:shadow-[0_14px_28px_-10px_rgba(255,255,255,1)] ring-1 ring-white/70 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  <span className="hidden sm:inline">{t("myFarms.actions.addNewFarm", { defaultValue: "Add Farm" })}</span>
                  <span className="sm:hidden">{t("myFarms.actions.addNewFarm", { defaultValue: "Add" })}</span>
                </motion.button>
              </DialogTrigger>
              <DialogContent className="w-[96vw] max-w-[96vw] sm:max-w-2xl h-[92vh] sm:h-[88vh] max-h-[92vh] overflow-hidden p-0 flex flex-col">
            <DialogHeader className="px-5 pt-5 pb-3 border-b border-border/60 bg-background">
              <DialogTitle className="text-base sm:text-lg">
                {editingId
                  ? t("myFarms.dialog.editFarmDetails", { defaultValue: "Edit Farm Details" })
                  : t("myFarms.dialog.addNewFarm", { defaultValue: "Add New Farm" })}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 px-5 py-4 overflow-y-auto flex-1 min-h-0">
              <div className="space-y-2">
                <Label>{t("myFarms.fields.farmPhoto", { defaultValue: "Farm Photo" })}</Label>
                <div className="flex items-center gap-4">
                  <div 
                    className="w-20 h-20 rounded-lg border-2 border-dashed flex items-center justify-center bg-muted cursor-pointer overflow-hidden hover:border-primary/50 transition-colors"
                    onClick={() => farmFileInputRef.current?.click()}
                  >
                    {newFarm.image ? (
                      <img src={newFarm.image} className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => farmFileInputRef.current?.click()}><Upload className="w-4 h-4" /> {t("myFarms.fields.uploadPhoto", { defaultValue: "Upload Photo" })}</Button>
                    <p className="text-[10px] text-muted-foreground">{t("myFarms.fields.photoHint", { defaultValue: "JPG or PNG. Max 2MB." })}</p>
                  </div>
                  <input type="file" ref={farmFileInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'farm')} />
                </div>
              </div>
              <div><Label>{t("myFarms.fields.farmName", { defaultValue: "Farm Name" })}</Label><Input placeholder={t("myFarms.fields.farmNamePlaceholder", { defaultValue: "e.g. Green Valley Farm" })} value={newFarm.name} onChange={(e) => setNewFarm({ ...newFarm, name: e.target.value })} /></div>
              <div><Label>{t("myFarms.fields.location", { defaultValue: "Location" })}</Label><Input placeholder={t("myFarms.fields.locationPlaceholder", { defaultValue: "e.g. Nashik, Maharashtra" })} value={newFarm.location} onChange={(e) => setNewFarm({ ...newFarm, location: e.target.value })} /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><Label>{t("myFarms.fields.size", { defaultValue: "Size" })}</Label><Input type="number" step="0.1" placeholder="5.5" value={newFarm.size} onChange={(e) => setNewFarm({ ...newFarm, size: e.target.value })} /></div>
                <div><Label>{t("myFarms.fields.unit", { defaultValue: "Unit" })}</Label>
                  <Select value={newFarm.unit} onValueChange={(v) => setNewFarm({ ...newFarm, unit: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Acres">{t("myFarms.units.acres", { defaultValue: "Acres" })}</SelectItem>
                      <SelectItem value="Hectares">{t("myFarms.units.hectares", { defaultValue: "Hectares" })}</SelectItem>
                      <SelectItem value="Bigha">{t("myFarms.units.bigha", { defaultValue: "Bigha" })}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>{t("myFarms.fields.soilType", { defaultValue: "Soil Type" })}</Label><Input placeholder={t("myFarms.fields.soilTypePlaceholder", { defaultValue: "e.g. Black Cotton Soil" })} value={newFarm.soilType} onChange={(e) => setNewFarm({ ...newFarm, soilType: e.target.value })} /></div>
              <div><Label>{t("myFarms.fields.irrigationType", { defaultValue: "Irrigation Type" })}</Label><Input placeholder={t("myFarms.fields.irrigationTypePlaceholder", { defaultValue: "e.g. Drip Irrigation" })} value={newFarm.irrigation} onChange={(e) => setNewFarm({ ...newFarm, irrigation: e.target.value })} /></div>
              
              <div className="pt-2 border-t border-border">
                <Label className="mb-2 block font-semibold">{t("myFarms.fields.activeCrops", { defaultValue: "Active Crops" })}</Label>
                <div className="space-y-2 mb-3">
                  {newFarm.crops.map((c, idx) => (
                    <motion.div 
                      key={idx} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between bg-muted/50 p-2 rounded-lg text-sm"
                    >
                      <span className="flex items-center gap-2">
                        <Sprout className="w-4 h-4 text-green-500" />
                        {c.name} 
                        <Badge variant="outline" className="text-[10px]">{statusLabelMap[c.status] || c.status}</Badge>
                      </span>
                      <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-red-500/10" onClick={() => handleRemoveCropFromForm(idx)}><X className="w-3 h-3" /></Button>
                    </motion.div>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Input placeholder={t("myFarms.fields.cropNamePlaceholder", { defaultValue: "Crop name" })} value={newCrop.name} onChange={(e) => setNewCrop({ ...newCrop, name: e.target.value })} />
                  <Select value={newCrop.status} onValueChange={(v) => setNewCrop({ ...newCrop, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Growing">{t("myFarms.status.growing", { defaultValue: "Growing" })}</SelectItem>
                      <SelectItem value="Harvesting">{t("myFarms.status.harvesting", { defaultValue: "Harvesting" })}</SelectItem>
                      <SelectItem value="Seedling">{t("myFarms.status.seedling", { defaultValue: "Seedling" })}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" className="w-full mt-2 gap-2 h-8 text-xs" onClick={handleAddCropToForm}>
                  <PlusCircle className="w-3 h-3" /> {t("myFarms.actions.addCropToList", { defaultValue: "Add Crop to List" })}
                </Button>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-border/60 bg-background shrink-0 sticky bottom-0 z-10">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="h-10 w-full whitespace-nowrap"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingId(null);
                    setNewFarm({ name: "", location: "", size: "", unit: "Acres", soilType: "", irrigation: "", image: "", crops: [] });
                  }}
                >
                  {t("myFarms.actions.cancel", { defaultValue: "Cancel" })}
                </Button>
                <Button className="h-10 w-full whitespace-nowrap bg-gradient-to-r from-green-500 to-emerald-500" onClick={handleSaveFarm}>
                  <span className="sm:hidden">{editingId ? t("myFarms.actions.save", { defaultValue: "Save" }) : t("myFarms.actions.create", { defaultValue: "Create" })}</span>
                  <span className="hidden sm:inline">{editingId ? t("myFarms.actions.saveChanges", { defaultValue: "Save Changes" }) : t("myFarms.actions.createFarmProfile", { defaultValue: "Create Farm Profile" })}</span>
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>
    </motion.div>

      {/* Summary Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { label: t("myFarms.summary.totalFarms", { defaultValue: "Total Farms" }), value: farms.length, icon: Building2, color: "from-green-500 to-green-600", textColor: "text-green-600", bgColor: "bg-green-50 dark:bg-green-950/30" },
          { label: t("myFarms.summary.totalArea", { defaultValue: "Total Area" }), value: `${totalArea.toFixed(1)} Acres`, icon: MapPin, color: "from-blue-500 to-blue-600", textColor: "text-blue-600", bgColor: "bg-blue-50 dark:bg-blue-950/30" },
          { label: t("myFarms.summary.activeCrops", { defaultValue: "Active Crops" }), value: totalCrops, icon: Wheat, color: "from-amber-500 to-amber-600", textColor: "text-amber-600", bgColor: "bg-amber-50 dark:bg-amber-950/30" },
          { label: "Avg Crops/Farm", value: averageCropsPerFarm, icon: BarChart3, color: "from-purple-500 to-purple-600", textColor: "text-purple-600", bgColor: "bg-purple-50 dark:bg-purple-950/30" },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 + i * 0.05 }}
          >
            <Card className="border border-border/50 overflow-hidden transition-all hover:shadow-lg">
              <CardContent className="p-5">
                <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center mb-3`}>
                  <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground mt-2">{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-1 xl:grid-cols-3 gap-4"
      >
        <Card className="xl:col-span-1 border border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-600" />
              Farm Health Pulse
            </CardTitle>
            <CardDescription className="text-xs">Current crop health distribution across all farms</CardDescription>
          </CardHeader>
          <CardContent>
            {totalHealthTracked > 0 ? (
              <div className="flex items-center gap-4">
                <div className="h-28 w-28 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={healthStats} dataKey="value" innerRadius={24} outerRadius={42} paddingAngle={3}>
                        {healthStats.map((entry, index) => (
                          <Cell key={`health-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value: number, name: string) => [`${value}`, healthLabelMap[name] || name]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 w-full">
                  {healthStats.map((stat) => (
                    <div key={stat.name} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stat.color }} />
                        {healthLabelMap[stat.name] || stat.name}
                      </span>
                      <span className="font-semibold text-foreground">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-5 text-sm text-muted-foreground">
                Add crops to view health analytics.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-2 border border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Farm Insights
            </CardTitle>
            <CardDescription className="text-xs">Largest farms by area and current overall health score</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-xl border border-blue-200/70 bg-blue-50/50 dark:bg-blue-950/20 p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Overall Health Score</p>
                <p className="text-2xl font-bold text-foreground">{healthScore}%</p>
              </div>
              <Badge className="bg-blue-600 text-white hover:bg-blue-600">
                {healthScore >= 80 ? "Excellent" : healthScore >= 60 ? "Stable" : "Needs Attention"}
              </Badge>
            </div>
            <div className="space-y-2">
              {topAreaFarms.length > 0 ? (
                topAreaFarms.map((farm, idx) => (
                  <div key={farm.id} className="rounded-lg border border-border/60 px-3 py-2 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">#{idx + 1} {farm.name}</p>
                      <p className="text-xs text-muted-foreground">{farm.location}</p>
                    </div>
                    <p className="text-sm font-semibold text-foreground">{farm.size} {farm.unit}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No farms available yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Farm Cards */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        <AnimatePresence mode="popLayout">
          {farms.map((farm, i) => (
            <motion.div 
              key={farm.id} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              transition={{ delay: i * 0.05 }}
            >
              <Card
                onClick={() => setSelectedFarm(farm)}
                className="hover:shadow-2xl transition-all duration-300 cursor-pointer group border border-border/60 bg-gradient-to-br from-background to-muted/20 hover:border-green-500/30"
              >
                {farm.image && (
                  <div className="h-44 w-full overflow-hidden rounded-t-xl relative">
                    <img src={farm.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={farm.name} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </div>
                )}
                <CardHeader className="pb-3 border-b border-border/50">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {farm.name}
                        <Badge variant="secondary" className="text-[10px]">{farm.crops.length} crops</Badge>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {farm.location}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-green-500/10 hover:text-green-600" onClick={() => handleEdit(farm)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-500/10 hover:text-red-600" onClick={() => handleDelete(farm.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="rounded-lg border border-border/60 bg-muted/30 px-2 py-2 flex items-center gap-1.5 text-muted-foreground">
                      <Building2 className="w-3.5 h-3.5 text-green-500" />
                      <span className="truncate">{farm.size} {farm.unit}</span>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-muted/30 px-2 py-2 flex items-center gap-1.5 text-muted-foreground">
                      <Leaf className="w-3.5 h-3.5 text-amber-500" />
                      <span className="truncate">{farm.soilType || "N/A"}</span>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-muted/30 px-2 py-2 flex items-center gap-1.5 text-muted-foreground">
                      <Droplet className="w-3.5 h-3.5 text-blue-500" />
                      <span className="truncate">{farm.irrigation || "N/A"}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
                      <Sprout className="w-3 h-3" />
                      {t("myFarms.fields.activeCrops", { defaultValue: "Active Crops" })}
                    </p>
                    <div className="space-y-2">
                      {farm.crops.map((crop) => (
                        <motion.div 
                          key={crop.name} 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-between bg-gradient-to-r from-muted/30 to-muted/10 rounded-lg px-3 py-2.5 hover:from-green-500/10 hover:to-emerald-500/10 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Sprout className="w-4 h-4 text-green-500" />
                            <span className="text-sm font-medium text-foreground">{crop.name}</span>
                            <Badge className={`text-[10px] ${statusColor[crop.status] || ""}`} variant="secondary">
                              {statusLabelMap[crop.status] || crop.status}
                            </Badge>
                          </div>
                          <Badge className={`text-[10px] ${healthColor[crop.health] || ""}`} variant="secondary">
                            {healthLabelMap[crop.health] || crop.health}
                          </Badge>
                        </motion.div>
                      ))}
                      {farm.crops.length === 0 && (
                        <div className="text-center py-4 text-muted-foreground/60">
                          <Sprout className="w-8 h-8 mx-auto mb-2 opacity-40" />
                          <p className="text-xs italic">{t("myFarms.empty.noCrops", { defaultValue: "No crops added yet" })}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-1">
                    <Button
                      variant="outline"
                      className="w-full h-8 text-xs border-green-500/20 text-green-700 hover:bg-green-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFarm(farm);
                      }}
                    >
                      View Farm Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {farms.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="border-dashed border-2 border-border/50 bg-gradient-to-br from-muted/20 to-muted/5">
            <CardContent className="py-12 text-center">
              <motion.div 
                animate={{ y: [0, -10, 0] }} 
                transition={{ duration: 2, repeat: Infinity }}
                className="mb-4"
              >
                <Sprout className="w-16 h-16 mx-auto text-muted-foreground/30" />
              </motion.div>
              <p className="text-lg font-semibold text-foreground">{t("myFarms.empty.noFarms", { defaultValue: "No farms added yet" })}</p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">{t("myFarms.empty.noFarmsHint", { defaultValue: "Start by adding your first farm" })}</p>
              <Button onClick={() => setIsFormOpen(true)} className="gap-2 bg-gradient-to-r from-green-500 to-emerald-500">
                <Plus className="w-4 h-4" />
                {t("myFarms.actions.addNewFarm", { defaultValue: "Add New Farm" })}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Farm Detail Dialog */}
      <Dialog open={!!selectedFarm} onOpenChange={() => setSelectedFarm(null)}>
        <DialogContent className="max-w-lg">
          {selectedFarm && (
            <>
              <DialogHeader><DialogTitle>{selectedFarm.name}</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-2 max-h-[70vh] overflow-y-auto pr-2">
                {selectedFarm.image && (
                  <div className="w-full h-48 rounded-xl overflow-hidden">
                    <img src={selectedFarm.image} className="w-full h-full object-cover" alt="" />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">{t("myFarms.fields.location", { defaultValue: "Location" })}</span><p className="font-medium text-foreground">{selectedFarm.location}</p></div>
                  <div><span className="text-muted-foreground">{t("myFarms.fields.size", { defaultValue: "Size" })}</span><p className="font-medium text-foreground">{selectedFarm.size} {selectedFarm.unit}</p></div>
                  <div><span className="text-muted-foreground">{t("myFarms.fields.soilType", { defaultValue: "Soil Type" })}</span><p className="font-medium text-foreground">{selectedFarm.soilType}</p></div>
                  <div><span className="text-muted-foreground">{t("myFarms.fields.irrigation", { defaultValue: "Irrigation" })}</span><p className="font-medium text-foreground">{selectedFarm.irrigation}</p></div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground mb-2">{t("myFarms.fields.cropDetails", { defaultValue: "Crop Details" })}</p>
                  {selectedFarm.crops.map((crop) => (
                    <Card key={crop.name} className="mb-2">
                      <CardContent className="p-3 flex gap-3">
                        {crop.image && <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0"><img src={crop.image} className="w-full h-full object-cover" /></div>}
                        <div className="flex-1 space-y-1 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-foreground">{crop.name}</span>
                          <Badge className={`${healthColor[crop.health] || ""}`} variant="secondary">{healthLabelMap[crop.health] || crop.health}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                          <span>{t("myFarms.fields.planted", { defaultValue: "Planted" })}: {crop.plantedDate}</span>
                          <span>{t("myFarms.fields.harvest", { defaultValue: "Harvest" })}: {crop.expectedHarvest}</span>
                        </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <PlusCircle className="w-4 h-4 text-primary" /> {t("myFarms.actions.quickAddCrop", { defaultValue: "Quick Add Crop" })}
                  </p>
                  <div className="space-y-3 p-3 bg-muted/30 rounded-xl border border-dashed border-border">
                    <div className="flex items-center gap-3 mb-2">
                      <div 
                        className="w-12 h-12 rounded-lg border border-dashed flex items-center justify-center bg-background cursor-pointer overflow-hidden"
                        onClick={() => cropFileInputRef.current?.click()}
                      >
                        {newCrop.image ? (
                          <img src={newCrop.image} className="w-full h-full object-cover" />
                        ) : (
                          <Camera className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => cropFileInputRef.current?.click()}>{t("myFarms.actions.uploadCropImage", { defaultValue: "Upload Crop Image" })}</Button>
                        <input type="file" ref={cropFileInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'crop')} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div><Label className="text-[10px]">{t("myFarms.fields.cropName", { defaultValue: "Crop Name" })}</Label><Input size={1} className="h-8 text-sm" placeholder={t("myFarms.fields.cropNameExample", { defaultValue: "e.g. Maize" })} value={newCrop.name} onChange={(e) => setNewCrop({ ...newCrop, name: e.target.value })} /></div>
                      <div><Label className="text-[10px]">{t("myFarms.fields.health", { defaultValue: "Health" })}</Label>
                        <Select value={newCrop.health} onValueChange={(v) => setNewCrop({ ...newCrop, health: v })}>
                          <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Healthy">{t("myFarms.health.healthy", { defaultValue: "Healthy" })}</SelectItem>
                            <SelectItem value="Good">{t("myFarms.health.good", { defaultValue: "Good" })}</SelectItem>
                            <SelectItem value="Needs Attention">{t("myFarms.health.needsAttention", { defaultValue: "Needs Attention" })}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><Label className="text-[10px]">{t("myFarms.fields.plantedDate", { defaultValue: "Planted Date" })}</Label><Input type="date" className="h-8 text-xs" value={newCrop.plantedDate} onChange={(e) => setNewCrop({ ...newCrop, plantedDate: e.target.value })} /></div>
                      <div><Label className="text-[10px]">{t("myFarms.fields.harvestDate", { defaultValue: "Harvest Date" })}</Label><Input type="date" className="h-8 text-xs" value={newCrop.expectedHarvest} onChange={(e) => setNewCrop({ ...newCrop, expectedHarvest: e.target.value })} /></div>
                    </div>
                    <div className="flex gap-2">
                      <Select value={newCrop.status} onValueChange={(v) => setNewCrop({ ...newCrop, status: v })}>
                        <SelectTrigger className="h-8 text-sm flex-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Growing">{t("myFarms.status.growing", { defaultValue: "Growing" })}</SelectItem>
                          <SelectItem value="Harvesting">{t("myFarms.status.harvesting", { defaultValue: "Harvesting" })}</SelectItem>
                          <SelectItem value="Seedling">{t("myFarms.status.seedling", { defaultValue: "Seedling" })}</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button className="h-8 text-xs px-4" onClick={() => handleAddCropToExistingFarm(selectedFarm.id)}>{t("myFarms.actions.addCrop", { defaultValue: "Add Crop" })}</Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
