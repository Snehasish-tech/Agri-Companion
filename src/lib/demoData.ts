// Demo data synced with edge function crop profiles
export type CropRecommendation = {
  crop_name: string;
  suitability_reason: string;
  estimated_cost: number;
  expected_roi: number;
  growth_duration: string;
  water_requirement: "low" | "medium" | "high";
  difficulty_level: "easy" | "medium" | "hard";
};

// Crop names translations (English -> Hindi -> Bengali)
export const CROP_TRANSLATIONS: Record<string, { en: string; hi: string; bn: string }> = {
  rice: { en: "Rice (Paddy)", hi: "चावल (धान)", bn: "ধান (চাল)" },
  wheat: { en: "Wheat", hi: "गेहूं", bn: "গম" },
  maize: { en: "Maize (Corn)", hi: "मक्का", bn: "ভুট্টা" },
  millet: { en: "Pearl Millet (Bajra)", hi: "बाजरा", bn: "বাজরা" },
  sorghum: { en: "Sorghum (Jowar)", hi: "ज्वार", bn: "জোয়ার" },
  cotton: { en: "Cotton", hi: "कपास", bn: "তুলা" },
  sugarcane: { en: "Sugarcane", hi: "गन्ना", bn: "আখ" },
  groundnut: { en: "Groundnut (Peanut)", hi: "मूंगफली", bn: "চিনাবাদাম" },
  soybean: { en: "Soybean", hi: "सोयाबीन", bn: "সয়াবিন" },
  chickpea: { en: "Chickpea (Gram)", hi: "चना", bn: "ছোলা" },
  lentil: { en: "Lentil (Masur)", hi: "मसूर दाल", bn: "মসুর ডাল" },
  mustard: { en: "Mustard (Rapeseed)", hi: "सरसों", bn: "সরিষা" },
  tomato: { en: "Tomato", hi: "टमाटर", bn: "টম্যাটো" },
  onion: { en: "Onion", hi: "प्याज", bn: "পেঁয়াজ" },
  potato: { en: "Potato", hi: "आलू", bn: "আলু" },
  sunflower: { en: "Sunflower", hi: "सूरजमुखी", bn: "সূর্যমুখী" },
  barley: { en: "Barley", hi: "जौ", bn: "যব" },
  pigeonpea: { en: "Pigeon Pea (Arhar)", hi: "अरहर दाल", bn: "অড়হর ডাল" },
  tea: { en: "Tea", hi: "चाय", bn: "চা" },
  jute: { en: "Jute (Golden Fiber)", hi: "जूट (सुनहरा रेशा)", bn: "পাট (সোনালি আঁশ)" },
  blackgram: { en: "Black Gram (Urad Dal)", hi: "उड़द दाल", bn: "কালো মুগ ডাল" },
  greengram: { en: "Green Gram (Moong Dal)", hi: "मूंग दाल", bn: "মুগ ডাল" },
  sesame: { en: "Sesame (Til)", hi: "तिल", bn: "তিল" },
  cauliflower: { en: "Cauliflower", hi: "फूलगोभी", bn: "ফুলকপি" },
  cabbage: { en: "Cabbage", hi: "पत्तागोभी", bn: "বাঁধাকপি" },
  brinjal: { en: "Brinjal (Eggplant)", hi: "बैंगन", bn: "বেগুন" },
  chilli: { en: "Green Chilli", hi: "हरी मिर्च", bn: "কাঁচা মরিচ" },
  banana: { en: "Banana", hi: "केला", bn: "কলা" },
  mango: { en: "Mango", hi: "आम", bn: "আম" },
  litchi: { en: "Litchi", hi: "लीची", bn: "লিচু" },
  betelnut: { en: "Betel Nut (Supari)", hi: "सुपारी", bn: "সুপারি" },
  pineapple: { en: "Pineapple", hi: "अनानास", bn: "আনারস" },
  ginger: { en: "Ginger", hi: "अदरक", bn: "আদা" },
  turmeric: { en: "Turmeric (Haldi)", hi: "हल्दी", bn: "হলুদ" },
};

// Enhanced CROP_PROFILES with West Bengal and Eastern India specific crops
export const CROP_PROFILES: Record<string, CropRecommendation> = {
  rice: { crop_name: "Rice (Paddy)", suitability_reason: "Staple crop suited for high water availability and monsoon season. Best for alluvial soils. Requires flooded fields and consistent moisture.", estimated_cost: 36000, expected_roi: 62, growth_duration: "120 days", water_requirement: "high", difficulty_level: "medium" },
  wheat: { crop_name: "Wheat", suitability_reason: "High-yielding cereal for cool season (rabi). Excellent for loamy and alluvial soils. Requires moderate water and well-drained fields.", estimated_cost: 24000, expected_roi: 55, growth_duration: "115 days", water_requirement: "medium", difficulty_level: "easy" },
  maize: { crop_name: "Maize (Corn)", suitability_reason: "Versatile crop for both kharif and rabi seasons. Adaptable to various soils. Good market demand and multiple uses - food, feed, industrial.", estimated_cost: 22000, expected_roi: 58, growth_duration: "105 days", water_requirement: "medium", difficulty_level: "easy" },
  millet: { crop_name: "Pearl Millet (Bajra)", suitability_reason: "Highly drought-resistant crop ideal for arid and semi-arid regions. Requires minimal water and fertilizer. Nutritious grain crop.", estimated_cost: 16000, expected_roi: 48, growth_duration: "95 days", water_requirement: "low", difficulty_level: "easy" },
  sorghum: { crop_name: "Sorghum (Jowar)", suitability_reason: "Drought-tolerant millet variety suitable for red and black soils. Low input requirement. Used for grain and fodder.", estimated_cost: 18000, expected_roi: 50, growth_duration: "100 days", water_requirement: "low", difficulty_level: "easy" },
  cotton: { crop_name: "Cotton", suitability_reason: "Premium cash crop best suited for black soil (Deccan Plateau). High water and nutrient requirement. Long growth cycle but excellent returns.", estimated_cost: 42000, expected_roi: 68, growth_duration: "165 days", water_requirement: "medium", difficulty_level: "hard" },
  sugarcane: { crop_name: "Sugarcane", suitability_reason: "High-return crop for sugar and jaggery production. Requires fertile soil, ample water, and long growing season. Heavy feeder crop.", estimated_cost: 56000, expected_roi: 72, growth_duration: "300 days", water_requirement: "high", difficulty_level: "hard" },
  groundnut: { crop_name: "Groundnut (Peanut)", suitability_reason: "Oil-rich legume with stable market demand. Well-suited for red and sandy soils. Improves soil nitrogen. Water-efficient crop.", estimated_cost: 21000, expected_roi: 54, growth_duration: "110 days", water_requirement: "low", difficulty_level: "easy" },
  soybean: { crop_name: "Soybean", suitability_reason: "Protein-rich legume excellent for crop rotation. Best for black and loamy soils. Improves soil fertility and commands premium prices.", estimated_cost: 20000, expected_roi: 52, growth_duration: "95 days", water_requirement: "medium", difficulty_level: "easy" },
  chickpea: { crop_name: "Chickpea (Gram)", suitability_reason: "Nitrogen-fixing legume for rabi season. Grows well in dry conditions and poor soils. Nutritious pulse with consistent demand.", estimated_cost: 17000, expected_roi: 50, growth_duration: "110 days", water_requirement: "low", difficulty_level: "easy" },
  lentil: { crop_name: "Lentil (Masur)", suitability_reason: "Nutritious pulse crop for dry winter season. Low water requirement. Enriches soil with nitrogen for next crop.", estimated_cost: 17500, expected_roi: 51, growth_duration: "105 days", water_requirement: "low", difficulty_level: "easy" },
  mustard: { crop_name: "Mustard (Rapeseed)", suitability_reason: "High-value oilseed for rabi season in North India. Suitable for various soils. Oil industry demand ensures good pricing.", estimated_cost: 18500, expected_roi: 53, growth_duration: "110 days", water_requirement: "low", difficulty_level: "easy" },
  tomato: { crop_name: "Tomato", suitability_reason: "High-demand vegetable with multiple growing seasons possible. Requires good drainage and regular irrigation. Premium prices in off-season.", estimated_cost: 32000, expected_roi: 66, growth_duration: "90 days", water_requirement: "medium", difficulty_level: "medium" },
  onion: { crop_name: "Onion", suitability_reason: "Essential vegetable with consistent year-round demand. Grows well in loamy soils. Good storage potential extends selling season.", estimated_cost: 29000, expected_roi: 64, growth_duration: "120 days", water_requirement: "medium", difficulty_level: "medium" },
  potato: { crop_name: "Potato", suitability_reason: "Staple vegetable crop with high productivity per unit area. Requires cool weather and good soil moisture. Multiple crops possible annually.", estimated_cost: 30000, expected_roi: 63, growth_duration: "100 days", water_requirement: "medium", difficulty_level: "medium" },
  sunflower: { crop_name: "Sunflower", suitability_reason: "Oil seed crop with excellent drought tolerance. Suitable for marginal lands and poor soils. Growing demand from confectionery industry.", estimated_cost: 21000, expected_roi: 49, growth_duration: "105 days", water_requirement: "low", difficulty_level: "easy" },
  barley: { crop_name: "Barley", suitability_reason: "Salt-tolerant cereal ideal for alkaline and saline soils. Used for malt industry and animal feed. Shorter growing season than wheat.", estimated_cost: 19000, expected_roi: 47, growth_duration: "110 days", water_requirement: "low", difficulty_level: "easy" },
  pigeonpea: { crop_name: "Pigeon Pea (Arhar)", suitability_reason: "Protein-rich legume for crop diversification. Grows on marginal lands. Deep rooting makes it drought-tolerant and improves soil structure.", estimated_cost: 20000, expected_roi: 52, growth_duration: "170 days", water_requirement: "low", difficulty_level: "easy" },
  
  // ===== WEST BENGAL & EASTERN INDIA SPECIFIC CROPS =====
  tea: { crop_name: "Tea", suitability_reason: "Premium plantation crop for hilly regions with acidic, well-drained soils. Darjeeling tea commands world's highest prices. Requires consistent rainfall, cool climate, and skilled labor. Perennial crop with long-term returns.", estimated_cost: 180000, expected_roi: 85, growth_duration: "3-4 years to first harvest", water_requirement: "high", difficulty_level: "hard" },
  jute: { crop_name: "Jute (Golden Fiber)", suitability_reason: "West Bengal's signature crop - India's largest producer. Thrives in alluvial soil with high moisture. Requires warm, humid climate. Strong demand from packaging industry and eco-friendly product manufacturers.", estimated_cost: 28000, expected_roi: 58, growth_duration: "120 days", water_requirement: "high", difficulty_level: "medium" },
  blackgram: { crop_name: "Black Gram (Urad Dal)", suitability_reason: "Important pulse crop in Bengal's crop rotation. Grows well in loamy to clay-loam soils. Nitrogen-fixing properties enrich soil. High protein content ensures steady market demand.", estimated_cost: 19000, expected_roi: 54, growth_duration: "90 days", water_requirement: "medium", difficulty_level: "easy" },
  greengram: { crop_name: "Green Gram (Moong Dal)", suitability_reason: "Fast-growing pulse ideal for summer season. Suitable for loamy soils. Short duration allows multiple cropping. Popular for sprouts with premium urban market prices.", estimated_cost: 18000, expected_roi: 52, growth_duration: "65 days", water_requirement: "low", difficulty_level: "easy" },
  sesame: { crop_name: "Sesame (Til)", suitability_reason: "Drought-tolerant oilseed for Bengal's laterite regions. Thrives in well-drained soils. Growing export demand for organic sesame oil. Fits well in crop rotation systems.", estimated_cost: 17000, expected_roi: 50, growth_duration: "90 days", water_requirement: "low", difficulty_level: "easy" },
  cauliflower: { crop_name: "Cauliflower", suitability_reason: "Major winter vegetable in Bengal plains. Requires cool climate and fertile soil. High yield potential with proper care. Strong local and export market demand.", estimated_cost: 38000, expected_roi: 72, growth_duration: "75 days", water_requirement: "medium", difficulty_level: "medium" },
  cabbage: { crop_name: "Cabbage", suitability_reason: "Popular winter vegetable with excellent storage. Grows well in alluvial and loamy soils. Consistent market demand throughout the year. Good for commercial farming.", estimated_cost: 35000, expected_roi: 68, growth_duration: "80 days", water_requirement: "medium", difficulty_level: "easy" },
  brinjal: { crop_name: "Brinjal (Eggplant)", suitability_reason: "Year-round vegetable cultivation possible in Bengal's climate. Adapts to various soil types. Multiple harvests from single planting. Strong local market preference.", estimated_cost: 30000, expected_roi: 65, growth_duration: "100 days", water_requirement: "medium", difficulty_level: "easy" },
  chilli: { crop_name: "Green Chilli", suitability_reason: "High-value crop with consistent demand in Bengal markets. Grows well in warm, humid conditions. Multiple pickings increase total yield and income spread over season.", estimated_cost: 32000, expected_roi: 70, growth_duration: "90 days", water_requirement: "medium", difficulty_level: "medium" },
  banana: { crop_name: "Banana", suitability_reason: "Profitable plantation crop for Bengal's subtropical climate. Year-round cultivation possible. High biomass helps in organic farming. Growing demand for tissue-culture varieties.", estimated_cost: 75000, expected_roi: 78, growth_duration: "12 months", water_requirement: "high", difficulty_level: "medium" },
  mango: { crop_name: "Mango", suitability_reason: "Premium fruit crop with excellent returns in Bengal's climate. Malda and Murshidabad varieties command premium prices. Long-term investment with 20+ years productivity.", estimated_cost: 120000, expected_roi: 82, growth_duration: "3-4 years to first harvest", water_requirement: "medium", difficulty_level: "medium" },
  litchi: { crop_name: "Litchi", suitability_reason: "High-value fruit crop for North Bengal regions. Muzaffarpur variety popular. Requires specific climate conditions. Limited cultivation period ensures premium pricing.", estimated_cost: 95000, expected_roi: 75, growth_duration: "3-5 years to bearing", water_requirement: "medium", difficulty_level: "hard" },
  betelnut: { crop_name: "Betel Nut (Supari)", suitability_reason: "Traditional plantation crop for Bengal and Northeast. Grows in tropical humid climate. Long-term perennial with 40+ years life. Strong cultural demand ensures stable market.", estimated_cost: 110000, expected_roi: 72, growth_duration: "7-8 years to bearing", water_requirement: "high", difficulty_level: "medium" },
  pineapple: { crop_name: "Pineapple", suitability_reason: "Suitable for laterite soils of Purulia and Bankura. Drought-resistant once established. Growing processed fruit industry. Multiple ratoon crops reduce replanting costs.", estimated_cost: 45000, expected_roi: 64, growth_duration: "18 months", water_requirement: "low", difficulty_level: "easy" },
  ginger: { crop_name: "Ginger", suitability_reason: "High-value spice crop for Bengal's hilly and terai regions. Grows well under tree shade. Export quality commands premium prices. Can be intercropped with other plantation crops.", estimated_cost: 55000, expected_roi: 76, growth_duration: "8-9 months", water_requirement: "high", difficulty_level: "medium" },
  turmeric: { crop_name: "Turmeric (Haldi)", suitability_reason: "Important spice crop with medicinal value. Well-suited for Bengal's loamy soils. Growing organic turmeric market. Good for crop diversification with long storage life.", estimated_cost: 42000, expected_roi: 68, growth_duration: "9 months", water_requirement: "medium", difficulty_level: "easy" },
};

// Enhanced soil/water/season priorities including West Bengal crops
const SOIL_PRIORITY: Record<string, string[]> = {
  alluvial: ["rice", "jute", "wheat", "sugarcane", "maize", "mustard", "potato", "cauliflower", "cabbage"],
  black: ["cotton", "soybean", "sorghum", "groundnut", "pigeonpea"],
  red: ["groundnut", "millet", "maize", "pigeonpea", "sunflower", "ginger", "turmeric"],
  laterite: ["millet", "groundnut", "sorghum", "maize", "pineapple", "sesame"],
  clay: ["rice", "jute", "wheat", "barley", "mustard", "onion"],
  loamy: ["tomato", "potato", "onion", "wheat", "maize", "cauliflower", "cabbage", "brinjal", "chilli"],
  sandy: ["groundnut", "millet", "mustard", "chickpea", "sesame", "pineapple"],
  saline: ["barley", "mustard", "sorghum", "cotton", "sunflower"],
  alkaline: ["barley", "mustard", "chickpea", "cotton", "sorghum"],
  rocky: ["millet", "sorghum", "pigeonpea", "groundnut", "sunflower"],
  silty: ["rice", "wheat", "maize", "mustard", "potato"],
  mountain: ["tea", "ginger", "turmeric", "litchi", "betelnut"],
  hilly: ["tea", "ginger", "turmeric", "pineapple", "litchi"],
  acidic: ["tea", "pineapple", "ginger", "turmeric", "litchi"],
  "well-drained": ["tea", "potato", "cauliflower", "ginger", "turmeric"],
};

const WATER_PRIORITY: Record<string, string[]> = {
  low: ["millet", "sorghum", "chickpea", "mustard", "groundnut", "pigeonpea", "sesame", "pineapple", "greengram"],
  medium: ["wheat", "maize", "soybean", "tomato", "onion", "potato", "cauliflower", "cabbage", "brinjal", "chilli", "blackgram", "turmeric", "mango", "litchi"],
  high: ["rice", "sugarcane", "cotton", "tomato", "potato", "jute", "tea", "banana", "ginger", "betelnut"],
};

const SEASON_PRIORITY: Record<string, string[]> = {
  kharif: ["rice", "maize", "cotton", "soybean", "groundnut", "pigeonpea", "jute", "sesame", "ginger", "turmeric"],
  rabi: ["wheat", "chickpea", "mustard", "barley", "lentil", "potato", "cauliflower", "cabbage", "tomato", "onion", "blackgram"],
  zaid: ["maize", "groundnut", "tomato", "onion", "sunflower", "greengram", "brinjal", "chilli"],
  yearround: ["banana", "tea", "betelnut", "mango", "litchi", "pineapple"],
};

const cloneRecommendations = (recommendations: CropRecommendation[]): CropRecommendation[] =>
  recommendations.map((item) => ({ ...item }));

// ===== COMPREHENSIVE WEST BENGAL LOCATION PROFILES =====
// Real agricultural data for accurate, region-specific recommendations

interface LocationProfile {
  district: string;
  region: string;
  soilTypes: string[];
  climate: string;
  avgRainfall: string;
  majorCrops: {
    [cropName: string]: {
      seasons: string[]; // When crop actually grows
      bestSoil: string[];
      investment: number;
      roi: number;
      notes: string;
    };
  };
}

const LOCATION_PROFILES: Record<string, LocationProfile> = {
  // ===== NORTH BENGAL - HIMALAYAN FOOTHILLS & TERAI =====
  "darjeeling": {
    district: "Darjeeling",
    region: "North Bengal (Himalayan)",
    soilTypes: ["mountain", "acidic", "well-drained", "hilly"],
    climate: "Cool temperate, 1500-3000mm rainfall",
    avgRainfall: "2500mm",
    majorCrops: {
      tea: { seasons: ["year-round"], bestSoil: ["acidic", "mountain", "well-drained"], investment: 180000, roi: 85, notes: "World-famous Darjeeling tea, flush season Mar-Nov" },
      ginger: { seasons: ["kharif"], bestSoil: ["acidic", "loamy"], investment: 55000, roi: 76, notes: "High-quality ginger in cool climate" },
      turmeric: { seasons: ["kharif"], bestSoil: ["loamy", "well-drained"], investment: 42000, roi: 68, notes: "Organic turmeric premium prices" },
      potato: { seasons: ["rabi"], bestSoil: ["loamy", "well-drained"], investment: 30000, roi: 63, notes: "High-quality hill potato" },
      maize: { seasons: ["kharif", "rabi"], bestSoil: ["loamy", "well-drained"], investment: 22000, roi: 58, notes: "Year-round with proper irrigation" },
      mandarin: { seasons: ["rabi"], bestSoil: ["acidic", "well-drained"], investment: 85000, roi: 74, notes: "Citrus cultivation in hills" }
    }
  },
  
  "kalimpong": {
    district: "Kalimpong",
    region: "North Bengal (Sub-Himalayan)",
    soilTypes: ["mountain", "acidic", "well-drained"],
    climate: "Sub-tropical highland, 2000-3000mm rainfall",
    avgRainfall: "2800mm",
    majorCrops: {
      tea: { seasons: ["year-round"], bestSoil: ["acidic", "well-drained"], investment: 180000, roi: 85, notes: "Similar quality to Darjeeling tea" },
      ginger: { seasons: ["kharif"], bestSoil: ["acidic", "loamy"], investment: 55000, roi: 76, notes: "High-altitude ginger" },
      gladiolus: { seasons: ["winter"], bestSoil: ["loamy", "well-drained"], investment: 48000, roi: 82, notes: "Famous flower cultivation region" },
      mandarin: { seasons: ["rabi"], bestSoil: ["acidic", "well-drained"], investment: 85000, roi: 74, notes: "Orange cultivation hub" }
    }
  },
  
  "jalpaiguri": {
    district: "Jalpaiguri",
    region: "North Bengal (Terai & Dooars)",
    soilTypes: ["alluvial", "loamy", "well-drained"],
    climate: "Humid subtropical, 2000-3500mm rainfall",
    avgRainfall: "3000mm",
    majorCrops: {
      tea: { seasons: ["year-round"], bestSoil: ["loamy", "well-drained", "acidic"], investment: 180000, roi: 85, notes: "Dooars tea garden belt" },
      jute: { seasons: ["kharif"], bestSoil: ["alluvial", "loamy"], investment: 28000, roi: 58, notes: "High fiber quality in humid climate" },
      rice: { seasons: ["kharif", "boro"], bestSoil: ["alluvial", "loamy"], investment: 36000, roi: 62, notes: "Multiple rice crops annually" },
      maize: { seasons: ["kharif", "rabi"], bestSoil: ["alluvial", "loamy"], investment: 22000, roi: 58, notes: "Good for fodder and grain" },
      pineapple: { seasons: ["summer"], bestSoil: ["well-drained", "loamy"], investment: 45000, roi: 64, notes: "Growing commercial cultivation" },
      betelnut: { seasons: ["year-round"], bestSoil: ["loamy", "well-drained"], investment: 110000, roi: 72, notes: "Traditional plantation crop" }
    }
  },
  
  "coochbehar": {
    district: "Cooch Behar",
    region: "North Bengal (Terai Plains)",
    soilTypes: ["alluvial", "sandy-loam"],
    climate: "Tropical wet, 2400-3200mm rainfall",
    avgRainfall: "2800mm",
    majorCrops: {
      jute: { seasons: ["kharif"], bestSoil: ["alluvial", "loamy"], investment: 28000, roi: 58, notes: "Major jute producing district" },
      rice: { seasons: ["kharif", "boro"], bestSoil: ["alluvial", "loamy"], investment: 36000, roi: 62, notes: "Paddy-jute rotation system" },
      maize: { seasons: ["kharif", "rabi"], bestSoil: ["alluvial", "sandy-loam"], investment: 22000, roi: 58, notes: "Increasing maize area" },
      mustard: { seasons: ["rabi"], bestSoil: ["alluvial", "loamy"], investment: 18500, roi: 53, notes: "Oilseed production zone" },
      potato: { seasons: ["rabi"], bestSoil: ["alluvial", "sandy-loam"], investment: 30000, roi: 63, notes: "Winter vegetable farming" },
      tobacco: { seasons: ["rabi"], bestSoil: ["sandy-loam", "well-drained"], investment: 52000, roi: 78, notes: "Traditional tobacco belt" }
    }
  },
  
  // ===== GANGETIC PLAINS - ALLUVIAL BELT =====
  "murshidabad": {
    district: "Murshidabad",
    region: "Central Bengal (Gangetic Plains)",
    soilTypes: ["alluvial", "loamy", "clay-loam"],
    climate: "Humid subtropical, 1400-1600mm rainfall",
    avgRainfall: "1500mm",
    majorCrops: {
      mango: { seasons: ["summer", "zaid", "year-round"], bestSoil: ["alluvial", "loamy"], investment: 120000, roi: 82, notes: "Famous Malda-Murshidabad mango belt, planting anytime, harvest May-July" },
      jute: { seasons: ["kharif"], bestSoil: ["alluvial", "clay-loam"], investment: 28000, roi: 58, notes: "Golden fiber capital of India" },
      rice: { seasons: ["kharif", "boro", "rabi"], bestSoil: ["alluvial", "loamy"], investment: 36000, roi: 62, notes: "Major rice growing area" },
      mustard: { seasons: ["rabi"], bestSoil: ["alluvial", "loamy"], investment: 18500, roi: 53, notes: "Oilseed cultivation Oct-Feb" },
      lentil: { seasons: ["rabi"], bestSoil: ["alluvial", "loamy"], investment: 17500, roi: 51, notes: "Pulse crop Nov-Feb" },
      potato: { seasons: ["rabi"], bestSoil: ["alluvial", "sandy-loam"], investment: 30000, roi: 63, notes: "Winter vegetable Nov-Feb" }
    }
  },
  
  "malda": {
    district: "Malda",
    region: "Central Bengal (Mango Belt)",
    soilTypes: ["alluvial", "loamy"],
    climate: "Tropical wet & dry, 1400mm rainfall",
    avgRainfall: "1400mm",
    majorCrops: {
      mango: { seasons: ["summer", "zaid", "year-round"], bestSoil: ["alluvial", "loamy"], investment: 120000, roi: 82, notes: "Fazli, Himsagar varieties world-famous. Planting anytime, Harvest May-July" },
      jute: { seasons: ["kharif"], bestSoil: ["alluvial", "loamy"], investment: 28000, roi: 58, notes: "Jute cultivation Apr-Sept" },
      rice: { seasons: ["kharif", "boro", "rabi"], bestSoil: ["alluvial", "loamy"], investment: 36000, roi: 62, notes: "Kharif Jun-Nov, Boro Dec-May" },
      maize: { seasons: ["kharif", "rabi"], bestSoil: ["alluvial", "loamy"], investment: 22000, roi: 58, notes: "Growing maize production" },
      wheat: { seasons: ["rabi"], bestSoil: ["alluvial", "loamy"], investment: 24000, roi: 55, notes: "Winter crop Nov-Mar" },
      lentil: { seasons: ["rabi"], bestSoil: ["alluvial", "loamy"], investment: 17500, roi: 51, notes: "Masoor dal cultivation" }
    }
  },
  
  "nadia": {
    district: "Nadia",
    region: "South-Central Bengal (Gangetic)",
    soilTypes: ["alluvial", "loamy", "clay-loam"],
    climate: "Humid subtropical, 1500mm rainfall",
    avgRainfall: "1500mm",
    majorCrops: {
      rice: { seasons: ["kharif", "boro"], bestSoil: ["alluvial", "clay-loam"], investment: 36000, roi: 62, notes: "Major rice bowl of Bengal" },
      jute: { seasons: ["kharif"], bestSoil: ["alluvial", "loamy"], investment: 28000, roi: 58, notes: "Golden fiber production" },
      potato: { seasons: ["rabi"], bestSoil: ["alluvial", "sandy-loam"], investment: 30000, roi: 63, notes: "Large-scale potato farming" },
      cauliflower: { seasons: ["rabi"], bestSoil: ["alluvial", "loamy"], investment: 38000, roi: 72, notes: "Winter vegetable Nov-Jan" },
      cabbage: { seasons: ["rabi"], bestSoil: ["alluvial", "loamy"], investment: 35000, roi: 68, notes: "Cool season crop Nov-Feb" },
      sugarcane: { seasons: ["year-round"], bestSoil: ["alluvial", "clay-loam"], investment: 56000, roi: 72, notes: "Planted Oct-Nov, harvest 12 months" }
    }
  },
  
  "hooghly": {
    district: "Hooghly",
    region: "South Bengal (Gangetic)",
    soilTypes: ["alluvial", "loamy"],
    climate: "Humid subtropical, 1600mm rainfall",
    avgRainfall: "1600mm",
    majorCrops: {
      rice: { seasons: ["kharif", "boro"], bestSoil: ["alluvial", "loamy"], investment: 36000, roi: 62, notes: "Aus, Aman, Boro varieties" },
      jute: { seasons: ["kharif"], bestSoil: ["alluvial", "loamy"], investment: 28000, roi: 58, notes: "Traditional jute area" },
      potato: { seasons: ["rabi"], bestSoil: ["alluvial", "sandy-loam"], investment: 30000, roi: 63, notes: "Commercial potato cultivation" },
      vegetable: { seasons: ["rabi", "summer"], bestSoil: ["alluvial", "loamy"], investment: 32000, roi: 66, notes: "Mixed vegetable farming" },
      mustard: { seasons: ["rabi"], bestSoil: ["alluvial", "loamy"], investment: 18500, roi: 53, notes: "Oilseed Nov-Feb" },
      wheat: { seasons: ["rabi"], bestSoil: ["alluvial", "loamy"], investment: 24000, roi: 55, notes: "Small-scale wheat" }
    }
  },
  
  // ===== WESTERN PLATEAU - LATERITE REGION =====
  "purulia": {
    district: "Purulia",
    region: "Western Bengal (Chotonagpur Plateau)",
    soilTypes: ["laterite", "red", "sandy"],
    climate: "Tropical dry, 1200-1400mm rainfall",
    avgRainfall: "1300mm",
    majorCrops: {
      pineapple: { seasons: ["summer"], bestSoil: ["laterite", "well-drained"], investment: 45000, roi: 64, notes: "Queen pineapple variety famous. Plant Jun-Jul, harvest after 18 months" },
      mango: { seasons: ["summer"], bestSoil: ["laterite", "red"], investment: 120000, roi: 82, notes: "Laterite belt mango, harvest May-June" },
      potato: { seasons: ["rabi"], bestSoil: ["red", "sandy"], investment: 30000, roi: 63, notes: "Major winter crop Nov-Feb" },
      mustard: { seasons: ["rabi"], bestSoil: ["laterite", "sandy"], investment: 18500, roi: 53, notes: "Drought-resistant oilseed" },
      millet: { seasons: ["kharif"], bestSoil: ["red", "sandy"], investment: 16000, roi: 48, notes: "Bajra cultivation in dry areas" },
      groundnut: { seasons: ["kharif", "summer"], bestSoil: ["sandy", "well-drained"], investment: 21000, roi: 54, notes: "Oilseed for laterite soils" }
    }
  },
  
  "bankura": {
    district: "Bankura",
    region: "Western Bengal (Laterite Zone)",
    soilTypes: ["laterite", "red", "sandy"],
    climate: "Tropical semi-arid, 1200mm rainfall",
    avgRainfall: "1200mm",
    majorCrops: {
      pineapple: { seasons: ["summer"], bestSoil: ["laterite", "red"], investment: 45000, roi: 64, notes: "Excellent quality pineapple" },
      potato: { seasons: ["rabi"], bestSoil: ["red", "sandy"], investment: 30000, roi: 63, notes: "Winter vegetable" },
      millet: { seasons: ["kharif"], bestSoil: ["red", "sandy"], investment: 16000, roi: 48, notes: "Pearl millet for dry farming" },
      groundnut: { seasons: ["kharif"], bestSoil: ["sandy", "laterite"], investment: 21000, roi: 54, notes: "Rainfed groundnut" },
      mustard: { seasons: ["rabi"], bestSoil: ["laterite", "sandy"], investment: 18500, roi: 53, notes: "Rapeseed-mustard" },
      tomato: { seasons: ["rabi", "summer"], bestSoil: ["red", "loamy"], investment: 32000, roi: 66, notes: "Vegetable farming with irrigation" }
    }
  },
  
  // ===== SOUTH BENGAL - COASTAL & SUNDARBANS =====
  "south24parganas": {
    district: "South 24 Parganas",
    region: "South Bengal (Coastal & Sundarbans)",
    soilTypes: ["alluvial", "saline", "clay"],
    climate: "Tropical humid, 1600-1800mm rainfall",
    avgRainfall: "1700mm",
    majorCrops: {
      rice: { seasons: ["kharif", "boro"], bestSoil: ["alluvial", "clay"], investment: 36000, roi: 62, notes: "Salt-tolerant varieties in coastal areas" },
      betelnut: { seasons: ["year-round"], bestSoil: ["alluvial", "loamy"], investment: 110000, roi: 72, notes: "Traditional Sundarbans crop" },
      coconut: { seasons: ["year-round"], bestSoil: ["alluvial", "sandy"], investment: 95000, roi: 70, notes: "Coastal coconut cultivation" },
      vegetable: { seasons: ["rabi"], bestSoil: ["alluvial", "loamy"], investment: 30000, roi: 65, notes: "Homestead vegetables" },
      honey: { seasons: ["spring"], bestSoil: ["n/a"], investment: 25000, roi: 88, notes: "World-famous Sundarbans honey, harvest Apr-May" },
      fish: { seasons: ["year-round"], bestSoil: ["n/a"], investment: 85000, roi: 75, notes: "Aquaculture and capture fishing" }
    }
  },
  
  "north24parganas": {
    district: "North 24 Parganas",
    region: "South Bengal (Suburban & Coastal)",
    soilTypes: ["alluvial", "loamy", "saline"],
    climate: "Humid subtropical, 1600mm rainfall",
    avgRainfall: "1600mm",
    majorCrops: {
      rice: { seasons: ["kharif", "boro"], bestSoil: ["alluvial", "loamy"], investment: 36000, roi: 62, notes: "Multiple paddy crops" },
      vegetable: { seasons: ["rabi", "summer"], bestSoil: ["alluvial", "loamy"], investment: 32000, roi: 66, notes: "Market gardening for Kolkata" },
      jute: { seasons: ["kharif"], bestSoil: ["alluvial", "loamy"], investment: 28000, roi: 58, notes: "Jute in non-saline areas" },
      betelnut: { seasons: ["year-round"], bestSoil: ["alluvial", "loamy"], investment: 110000, roi: 72, notes: "Plantation crop" },
      fish: { seasons: ["year-round"], bestSoil: ["n/a"], investment: 85000, roi: 75, notes: "Brackish water aquaculture" },
      flowers: { seasons: ["year-round"], bestSoil: ["alluvial", "loamy"], investment: 42000, roi: 78, notes: "Commercial floriculture near Kolkata" }
    }
  }
};

// Simplified location priority mapping (for backward compatibility)
const LOCATION_PRIORITY: Record<string, string[]> = {
  // North Bengal - Hilly & Terai regions
  "darjeeling": ["tea", "ginger", "turmeric", "litchi", "maize", "potato"],
  "kalimpong": ["tea", "ginger", "turmeric", "litchi", "mandarin", "pineapple"],
  "jalpaiguri": ["tea", "jute", "rice", "maize", "pineapple", "betelnut"],
  "coochbehar": ["jute", "rice", "maize", "mustard", "potato", "tobacco"],
  "alipurduar": ["tea", "rice", "jute", "maize", "betelnut", "pineapple"],
  
  // Gangetic Plains - Alluvial soil regions
  "murshidabad": ["mango", "jute", "rice", "mustard", "lentil", "potato"],
  "nadia": ["rice", "jute", "potato", "cauliflower", "cabbage", "sugarcane"],
  "burdwan": ["rice", "potato", "wheat", "mustard", "vegetable", "jute"],
  "bardhaman": ["rice", "potato", "wheat", "mustard", "onion", "jute"],
  "hooghly": ["rice", "jute", "potato", "vegetable", "mustard", "wheat"],
  "howrah": ["rice", "jute", "potato", "vegetable", "banana", "betelnut"],
  "kolkata": ["vegetable", "rice", "jute", "banana", "betelnut", "flowers"],
  
  // South Bengal - Coastal & Sundarbans
  "southkhali": ["rice", "betelnut", "coconut", "prawn", "crab", "honey"],
  "kakdwip": ["rice", "betelnut", "vegetable", "prawn", "fish", "honey"],
  "sagar": ["rice", "vegetable", "coconut", "prawn", "fish", "betelnut"],
  "diamond harbour": ["rice", "vegetable", "prawn", "fish", "betelnut"],
  
  // Western Plateau - Laterite regions
  "purulia": ["pineapple", "mango", "potato", "mustard", "millet", "groundnut"],
  "bankura": ["pineapple", "potato", "millet", "groundnut", "mustard", "tomato"],
  "jhargram": ["rice", "pineapple", "potato", "vegetable", "millet", "maize"],
  "westmidnapore": ["rice", "potato", "vegetable", "groundnut", "cashew", "betelnut"],
  "paschim medinipur": ["rice", "potato", "vegetable", "groundnut", "cashew"],
  
  // Central & South Bengal
  "birbhum": ["rice", "potato", "mustard", "gram", "wheat", "vegetable"],
  "malda": ["mango", "jute", "rice", "maize", "wheat", "lentil"],
  "northdinajpur": ["rice", "jute", "maize", "potato", "mustard", "wheat"],
  "southdinajpur": ["rice", "jute", "maize", "potato", "mustard", "wheat"],
};


// Helper function to get location profile
export const getLocationProfile = (location: string): LocationProfile | null => {
  if (!location) return null;
  const loc = location.toLowerCase().trim();
  
  // Check exact and partial matches
  for (const [key, profile] of Object.entries(LOCATION_PROFILES)) {
    const districtLower = profile.district.toLowerCase();
    if (loc.includes(key.toLowerCase()) || 
        key.toLowerCase().includes(loc) || 
        districtLower.includes(loc) ||
        loc.includes(districtLower)) {
      return profile;
    }
  }
  
  return null;
};

// Validate if a crop can grow in a specific season
const validateCropSeason = (cropName: string, season: string, locationProfile?: LocationProfile | null): boolean => {
  if (!locationProfile || !locationProfile.majorCrops[cropName]) {
    return true; // If no profile, don't filter
  }
  
  const cropInfo = locationProfile.majorCrops[cropName];
  const seasonLower = season.toLowerCase().trim();
  
  // Year-round crops are always valid
  if (cropInfo.seasons.some(s => s.toLowerCase() === "year-round")) {
    return true;
  }
  
  // Check if the crop grows in this season
  return cropInfo.seasons.some(s => {
    const cropSeason = s.toLowerCase();
    return cropSeason.includes(seasonLower) || seasonLower.includes(cropSeason);
  });
};

// Helper function to detect location from input string (case-insensitive partial matching)
const detectLocationCrops = (location: string): string[] => {
  if (!location) return [];
  
  // Try to get full profile first
  const profile = getLocationProfile(location);
  if (profile) {
    return Object.keys(profile.majorCrops);
  }
  
  // Fallback to simpler mapping
  const loc = location.toLowerCase().trim();
  
  // Direct matches
  for (const [key, crops] of Object.entries(LOCATION_PRIORITY)) {
    if (loc.includes(key.toLowerCase()) || key.toLowerCase().includes(loc)) {
      return crops;
    }
  }
  
  // Broader regional matches
  if (loc.includes("darj") || loc.includes("hill") || loc.includes("tea")) {
    return ["tea", "ginger", "turmeric", "litchi", "maize", "potato"];
  }
  if (loc.includes("north bengal") || loc.includes("uttar banga")) {
    return ["tea", "jute", "rice", "maize", "potato", "ginger"];
  }
  if (loc.includes("sundarbans") || loc.includes("coastal")) {
    return ["rice", "betelnut", "coconut", "vegetable"];
  }
  if (loc.includes("purulia") || loc.includes("bankura") || loc.includes("laterite")) {
    return ["pineapple", "potato", "millet", "groundnut", "mustard"];
  }
  
  return [];
};

// Enhanced build recommendations with location intelligence and season validation
const buildDemoRecommendations = (soilType?: string, waterAvailability?: string, season?: string, budget?: number, location?: string): CropRecommendation[] => {
  const soil = (soilType || "loamy").toLowerCase().trim();
  const water = (waterAvailability || "medium").toLowerCase().trim();
  const seasonVal = (season || "kharif").toLowerCase().trim();
  const budgetVal = Math.max(0, budget || 0);

  // Get location-specific crops FIRST (these get highest priority)
  const locationCropsList = location ? detectLocationCrops(location) : [];
  const locationProfile = location ? getLocationProfile(location) : null;
  
  // ===== BUILD CANDIDATE LIST =====
  const candidates: string[] = [];
  
  // 1. LOCATION-BASED PRIORITY (Highest priority - these go first)
  if (locationCropsList.length > 0) {
    candidates.push(...locationCropsList);
  }
  
  // 2. Add soil-matched crops
  if (SOIL_PRIORITY[soil]) {
    for (const crop of SOIL_PRIORITY[soil]) {
      if (!candidates.includes(crop)) candidates.push(crop);
    }
  }
  
  // 3. Then water-matched crops
  if (WATER_PRIORITY[water]) {
    for (const crop of WATER_PRIORITY[water]) {
      if (!candidates.includes(crop)) candidates.push(crop);
    }
  }
  
  // 4. Then season-matched crops
  if (SEASON_PRIORITY[seasonVal]) {
    for (const crop of SEASON_PRIORITY[seasonVal]) {
      if (!candidates.includes(crop)) candidates.push(crop);
    }
  }
  
  // 5. Fill remaining with default order
  const defaultOrder = ["rice", "jute", "potato", "tea", "wheat", "maize", "millet", "groundnut", "mustard", "tomato", "cauliflower", "cabbage"];
  for (const crop of defaultOrder) {
    if (!candidates.includes(crop)) candidates.push(crop);
  }

  // ===== SEPARATE LOCATION CROPS FROM OTHERS =====
  // Location crops should ALWAYS be at top regardless of other filters
  const locationCropsInCandidates = candidates.filter(c => locationCropsList.includes(c));
  const otherCrops = candidates.filter(c => !locationCropsList.includes(c));

  // ===== SEASON VALIDATION (only for non-location crops) =====
  // Location crops bypass season filter - they are regional specialties
  const seasonFilteredOthers = otherCrops.filter(cropName => {
    if (locationProfile && locationProfile.majorCrops[cropName]) {
      return validateCropSeason(cropName, seasonVal, locationProfile);
    }
    return true;
  });

  // ===== BUDGET FILTER =====
  let filteredLocationCrops = locationCropsInCandidates;
  let filteredOtherCrops = seasonFilteredOthers;
  
  if (budgetVal > 0) {
    // Location crops get very flexible budget (5x) - they are must-recommend for region
    filteredLocationCrops = locationCropsInCandidates.filter(cropName => {
      const profile = CROP_PROFILES[cropName];
      return profile && profile.estimated_cost <= budgetVal * 5;
    });
    
    // Other crops get normal budget flexibility (1.5x)
    filteredOtherCrops = seasonFilteredOthers.filter(cropName => {
      const profile = CROP_PROFILES[cropName];
      return profile && profile.estimated_cost <= budgetVal * 1.5;
    });
    
    // If all location crops filtered out, keep them anyway (regional must-haves)
    if (filteredLocationCrops.length === 0 && locationCropsInCandidates.length > 0) {
      filteredLocationCrops = locationCropsInCandidates.slice(0, 2); // Keep at least top 2
    }
  }

  // ===== COMBINE: Location crops FIRST, then others =====
  const finalList = [...filteredLocationCrops, ...filteredOtherCrops];
  
  // Take top 5
  const picked = finalList.slice(0, 5);

  // Ensure we always have 5 crops
  while (picked.length < 5) {
    const next = candidates.find((c) => !picked.includes(c));
    if (!next) break;
    picked.push(next);
  }

  return cloneRecommendations(
    picked
      .slice(0, 5)
      .map((name) => CROP_PROFILES[name])
      .filter((crop): crop is CropRecommendation => Boolean(crop))
  );
};

export const DEFAULT_DEMO_RECOMMENDATIONS = buildDemoRecommendations();

// Extended demo data by region, soil, water, season - comprehensive information
const EXTENDED_DEMO_DATA: Record<string, CropRecommendation[]> = {
  // ===== ALLUVIAL SOIL (North India) =====
  "alluvial_kharif_high": [
    { crop_name: "Rice", suitability_reason: "Perfect for North Indian plains monsoon season. Alluvial soils retain moisture well. Yields 50-60 quintals/hectare in this region.", estimated_cost: 36000, expected_roi: 62, growth_duration: "120 days", water_requirement: "high", difficulty_level: "medium" },
    { crop_name: "Maize (Corn)", suitability_reason: "Thrives in kharif season with good rainfall. Popular in Haryana and Punjab for commercial use. Good market at Rs 1800-2000/quintal.", estimated_cost: 22000, expected_roi: 58, growth_duration: "105 days", water_requirement: "medium", difficulty_level: "easy" },
    { crop_name: "Soybean", suitability_reason: "Increasingly popular in North India. Nitrogen-fixing improves soil for next wheat crop. Growing demand as protein crop. Yields 20-25 quintals/hectare.", estimated_cost: 20000, expected_roi: 52, growth_duration: "95 days", water_requirement: "medium", difficulty_level: "easy" },
    { crop_name: "Cotton", suitability_reason: "Suitable in Punjab and Haryana with modern irrigation. Requires pest management. Premium prices in international market.", estimated_cost: 42000, expected_roi: 68, growth_duration: "165 days", water_requirement: "medium", difficulty_level: "hard" },
    { crop_name: "Pigeonpea (Arhar)", suitability_reason: "Intercropped with maize/sorghum. Nitrogen-fixing benefits following crop. Consistent 3000-3500/quintal pricing. Long duration but stable returns.", estimated_cost: 20000, expected_roi: 52, growth_duration: "170 days", water_requirement: "low", difficulty_level: "easy" },
  ],
  "alluvial_rabi_medium": [
    { crop_name: "Wheat", suitability_reason: "Staple of North Indian agriculture. Yields 45-55 quintals/hectare with good irrigation. Stable government procurement at MSP ensures reliable income.", estimated_cost: 24000, expected_roi: 55, growth_duration: "115 days", water_requirement: "medium", difficulty_level: "easy" },
    { crop_name: "Chickpea (Gram)", suitability_reason: "Low water requirement suits winter season. Nitrogen-fixing enriches soil after wheat. Protein-rich, premium prices at Rs 4500-5000/quintal.", estimated_cost: 17000, expected_roi: 50, growth_duration: "110 days", water_requirement: "low", difficulty_level: "easy" },
    { crop_name: "Mustard (Rapeseed)", suitability_reason: "High-value oilseed in Punjab and Haryana. Oil extraction profitable. Yields 18-22 quintals/hectare. Government procurement ensures price support.", estimated_cost: 18500, expected_roi: 53, growth_duration: "110 days", water_requirement: "low", difficulty_level: "easy" },
    { crop_name: "Potato", suitability_reason: "High productivity with proper irrigation in UP plains. Multiple uses - food, starch, seed. Rs 12-15 per kg even in casual market.", estimated_cost: 30000, expected_roi: 63, growth_duration: "100 days", water_requirement: "medium", difficulty_level: "medium" },
    { crop_name: "Lentil (Masur)", suitability_reason: "Growing demand in rabi season. Suits cooler climates. Nitrogen-fixing benefits soil. Premium pricing at Rs 5500-6000/quintal.", estimated_cost: 17500, expected_roi: 51, growth_duration: "105 days", water_requirement: "low", difficulty_level: "easy" },
  ],

  // ===== BLACK SOIL (Deccan Plateau) =====
  "black_kharif_medium": [
    { crop_name: "Cotton", suitability_reason: "Black soil (Regur) is ideal for cotton. Deep moisture retention suits long growth. Premium fibre quality commands 35-40% export price premium.", estimated_cost: 42000, expected_roi: 68, growth_duration: "165 days", water_requirement: "medium", difficulty_level: "hard" },
    { crop_name: "Soybean", suitability_reason: "Black soil structure ideal. Improves soil aggregation. Growing demand in India and export markets. Yields 18-22 quintals/hectare.", estimated_cost: 20000, expected_roi: 52, growth_duration: "95 days", water_requirement: "medium", difficulty_level: "easy" },
    { crop_name: "Sorghum (Jowar)", suitability_reason: "Draught-tolerant, suits monsoon-dependent areas. Used for food, feed, fodder. Stable pricing at Rs 2800-3200/quintal.", estimated_cost: 18000, expected_roi: 50, growth_duration: "100 days", water_requirement: "low", difficulty_level: "easy" },
    { crop_name: "Groundnut (Peanut)", suitability_reason: "Well-suited to Telangana and Karnataka plateau regions. Oil extraction profitable. Yields 18-25 quintals/hectare (unshelled).", estimated_cost: 21000, expected_roi: 54, growth_duration: "110 days", water_requirement: "low", difficulty_level: "easy" },
    { crop_name: "Pigeonpea (Arhar)", suitability_reason: "Deep-rooted, drought-tolerant. Black soil retention suits varieties. Intercropping with cotton reduces risk. Yields 15-18 quintals/hectare.", estimated_cost: 20000, expected_roi: 52, growth_duration: "170 days", water_requirement: "low", difficulty_level: "easy" },
  ],
  "black_rabi_low": [
    { crop_name: "Chickpea (Gram)", suitability_reason: "MAJOR CROP for black soil in rabi. Yields 20-25 quintals/hectare. MSP protection at Rs 5250/quintal. Low water requirement ideal for dry winter.", estimated_cost: 17000, expected_roi: 50, growth_duration: "110 days", water_requirement: "low", difficulty_level: "easy" },
    { crop_name: "Mustard (Rapeseed)", suitability_reason: "Adapted to Malwa plateau. Oil extraction for biofuel emerging industry. Yields 12-15 quintals/hectare. Stable pricing.", estimated_cost: 18500, expected_roi: 53, growth_duration: "110 days", water_requirement: "low", difficulty_level: "easy" },
    { crop_name: "Lentil (Masur)", suitability_reason: "Marginal lands suitable. Improves soil. Premium dal prices Rs 6500-7000/quintal. Low fertilizer requirement reduces costs.", estimated_cost: 17500, expected_roi: 51, growth_duration: "105 days", water_requirement: "low", difficulty_level: "easy" },
    { crop_name: "Barley", suitability_reason: "Saline/alkaline soil tolerance helps degraded black soil. Malt industry demand growing. Climate change adaptation crop.", estimated_cost: 19000, expected_roi: 47, growth_duration: "110 days", water_requirement: "low", difficulty_level: "easy" },
  ],

  // ===== RED SOIL (South India) =====
  "red_kharif_low": [
    { crop_name: "Groundnut (Peanut)", suitability_reason: "RED SOIL SPECIALIST. Excellent drainage. Red soil Al saturation managed by groundnut. Tamil Nadu #1 groundnut state. Yields 24-28 quintals/hectare (unshelled).", estimated_cost: 21000, expected_roi: 54, growth_duration: "110 days", water_requirement: "low", difficulty_level: "easy" },
    { crop_name: "Sorghum (Jowar)", suitability_reason: "Drought-resistant on red soil. Millets for nutri-cereals gaining traction. Food, feed, biofuel uses. Yields 15-18 quintals/hectare.", estimated_cost: 18000, expected_roi: 50, growth_duration: "100 days", water_requirement: "low", difficulty_level: "easy" },
    { crop_name: "Pearl Millet (Bajra)", suitability_reason: "Most drought-tolerant option. Climate change adaptation crop. Nutrition-dense staple. Yields 8-12 quintals/hectare even in marginal lands.", estimated_cost: 16000, expected_roi: 48, growth_duration: "95 days", water_requirement: "low", difficulty_level: "easy" },
    { crop_name: "Sunflower", suitability_reason: "Red soil compatible. Oil extraction profitable. Biofuel industry emerging. Yields 15-18 quintals/hectare (seeds).", estimated_cost: 21000, expected_roi: 49, growth_duration: "105 days", water_requirement: "low", difficulty_level: "easy" },
    { crop_name: "Maize (Corn)", suitability_reason: "With irrigation, excellent returns. Poultry feed demand growing. Yields 35-40 quintals/hectare irrigated. Rs 1800-2000/quintal pricing.", estimated_cost: 22000, expected_roi: 58, growth_duration: "105 days", water_requirement: "medium", difficulty_level: "easy" },
  ],
  "red_zaid_low": [
    { crop_name: "Groundnut (Peanut)", suitability_reason: "Summer season cultivation with drip irrigation. Early harvest premium pricing. Yields 20-24 quintals/hectare.", estimated_cost: 21000, expected_roi: 54, growth_duration: "110 days", water_requirement: "low", difficulty_level: "easy" },
    { crop_name: "Sunflower", suitability_reason: "Summer season with supplemental irrigation. Quick maturity matches summer window. Drip-friendly crop.", estimated_cost: 21000, expected_roi: 49, growth_duration: "105 days", water_requirement: "low", difficulty_level: "easy" },
    { crop_name: "Tomato", suitability_reason: "Off-season cultivation commands premium. Greenhouse/shade-net farming profitable. Yields 40-50 tonnes/hectare.", estimated_cost: 32000, expected_roi: 66, growth_duration: "90 days", water_requirement: "medium", difficulty_level: "medium" },
    { crop_name: "Onion", suitability_reason: "Summer onion variety demand high. Drip irrigation essential. Trellising reduces land use. Rs 20-25/kg premium pricing.", estimated_cost: 29000, expected_roi: 64, growth_duration: "120 days", water_requirement: "medium", difficulty_level: "medium" },
  ],

  // ===== SANDY/LIGHT SOIL (Arid Regions) =====
  "sandy_kharif_low": [
    { crop_name: "Pearl Millet (Bajra)", suitability_reason: "IDEAL for sandy Rajasthan. Minimal water, minimal input. Climate-adapted. Yields 6-10 quintals/hectare even in dryland. Food security crop.", estimated_cost: 16000, expected_roi: 48, growth_duration: "95 days", water_requirement: "low", difficulty_level: "easy" },
    { crop_name: "Sorghum (Jowar)", suitability_reason: "Multi-millet intercropping reduces risk. Nutrition-dense. Growing organic market demand. Festival/ceremonial demand stable.", estimated_cost: 18000, expected_roi: 50, growth_duration: "100 days", water_requirement: "low", difficulty_level: "easy" },
    { crop_name: "Groundnut (Peanut)", suitability_reason: "With drip irrigation, good returns. Gujarat major groundnut producer. Oil extraction at farm level profitable. Yields 18-22 quintals/hectare.", estimated_cost: 21000, expected_roi: 54, growth_duration: "110 days", water_requirement: "low", difficulty_level: "easy" },
    { crop_name: "Sesame (Til)", suitability_reason: "Premium oilseed. Minimal fertilizer needs suit poor soils. International market demand. High unit price at Rs 12-15/kg.", estimated_cost: 19000, expected_roi: 55, growth_duration: "100 days", water_requirement: "low", difficulty_level: "medium" },
  ],
  "sandy_rabi_low": [
    { crop_name: "Mustard (Rapeseed)", suitability_reason: "MAJOR RABI CROP in Gujarat and Rajasthan. Oil extraction at village level. Biofuel potential. Yields 12-15 quintals/hectare. Stable MSP Rs 5050/quintal.", estimated_cost: 18500, expected_roi: 53, growth_duration: "110 days", water_requirement: "low", difficulty_level: "easy" },
    { crop_name: "Chickpea (Gram)", suitability_reason: "Marginal land suitable. Deep-rooting handles sandy soil. Pulse premium pricing. Yields 15-18 quintals/hectare in Rajasthan.", estimated_cost: 17000, expected_roi: 50, growth_duration: "110 days", water_requirement: "low", difficulty_level: "easy" },
    { crop_name: "Barley", suitability_reason: "Salt tolerance helps degraded soils. Malt industry demand. Winter water balance favorable. Export potential growing.", estimated_cost: 19000, expected_roi: 47, growth_duration: "110 days", water_requirement: "low", difficulty_level: "easy" },
    { crop_name: "Lentil (Masur)", suitability_reason: "Marginal lands specialist. Yields 8-12 quintals/hectare. Premium dal Rs 6500-7000. Easily intercropped.", estimated_cost: 17500, expected_roi: 51, growth_duration: "105 days", water_requirement: "low", difficulty_level: "easy" },
  ],

  // ===== LOAMY SOIL (Balanced Soil) =====
  "loamy_kharif_medium": [
    { crop_name: "Tomato", suitability_reason: "Loamy soil ideal drainage. High-value vegetable year-round. Pune-Nashik tomato belt example. Yields 40-50 tonnes/hectare.", estimated_cost: 32000, expected_roi: 66, growth_duration: "90 days", water_requirement: "medium", difficulty_level: "medium" },
    { crop_name: "Potato", suitability_reason: "Loamy soil perfect structure for tuber development. Yields 30-40 tonnes/hectare. Multiple crops possible annually.", estimated_cost: 30000, expected_roi: 63, growth_duration: "100 days", water_requirement: "medium", difficulty_level: "medium" },
    { crop_name: "Onion", suitability_reason: "Loamy soil ideal for bulb development. Nashik, Indore onion corridors example. Yields 30-40 tonnes/hectare.", estimated_cost: 29000, expected_roi: 64, growth_duration: "120 days", water_requirement: "medium", difficulty_level: "medium" },
    { crop_name: "Maize (Corn)", suitability_reason: "Loamy soil balanced fertility. Good for irrigated cultivation. Yields 45-50 quintals/hectare.", estimated_cost: 22000, expected_roi: 58, growth_duration: "105 days", water_requirement: "medium", difficulty_level: "easy" },
    { crop_name: "Wheat", suitability_reason: "Loamy soil excellent for wheat. Well-drained prevents disease. Yields 40-45 quintals/hectare.", estimated_cost: 24000, expected_roi: 55, growth_duration: "115 days", water_requirement: "medium", difficulty_level: "easy" },
  ],
  "loamy_rabi_medium": [
    { crop_name: "Tomato", suitability_reason: "Winter tomato season. Off-season commands premium. Drip irrigation optimal. Yields 50-60 tonnes/hectare with care.", estimated_cost: 32000, expected_roi: 66, growth_duration: "90 days", water_requirement: "medium", difficulty_level: "medium" },
    { crop_name: "Potato", suitability_reason: "Loamy soil winter season crop. Seed potato production areas. Yields 35-40 tonnes/hectare.", estimated_cost: 30000, expected_roi: 63, growth_duration: "100 days", water_requirement: "medium", difficulty_level: "medium" },
    { crop_name: "Onion", suitability_reason: "Winter onion season. Bulbing suits cool weather. Storage stability. Yields 35-45 tonnes/hectare.", estimated_cost: 29000, expected_roi: 64, growth_duration: "120 days", water_requirement: "medium", difficulty_level: "medium" },
    { crop_name: "Wheat", suitability_reason: "Rabi season staple. Loamy soil excellent water holding capacity. Yields 45-50 quintals/hectare.", estimated_cost: 24000, expected_roi: 55, growth_duration: "115 days", water_requirement: "medium", difficulty_level: "easy" },
  ],

  // ===== INTENSIVE IRRIGATION =====
  "irrigated_intensive": [
    { crop_name: "Sugarcane", suitability_reason: "Best productivity with assured irrigation. Sugar factory contracts provide stability. Co-generation energy revenue. Yields 60-70 tonnes/hectare.", estimated_cost: 56000, expected_roi: 72, growth_duration: "300 days", water_requirement: "high", difficulty_level: "hard" },
    { crop_name: "Cotton", suitability_reason: "Drip irrigation enables precision. Premium fiber potential. Textile industry demand. Organic-certified premium possible. Yields 18-20 quintals/hectare.", estimated_cost: 42000, expected_roi: 68, growth_duration: "165 days", water_requirement: "medium", difficulty_level: "hard" },
    { crop_name: "Tomato", suitability_reason: "Intensive cultivation with drip. Protected farming possible. Off-season premium. Exports to metros command prices. Yields 45-50 tonnes/hectare.", estimated_cost: 32000, expected_roi: 66, growth_duration: "90 days", water_requirement: "medium", difficulty_level: "medium" },
    { crop_name: "Onion", suitability_reason: "Year-round cultivation with managed irrigation. Agri-export zones. Storage infrastructure available. Processing units. Yields 40-45 tonnes/hectare.", estimated_cost: 29000, expected_roi: 64, growth_duration: "120 days", water_requirement: "medium", difficulty_level: "medium" },
    { crop_name: "Potato", suitability_reason: "Intensive high-yield cultivation. Seed potential. Multiple crops annually. Value-addition facilities. Yields 40-50 tonnes/hectare.", estimated_cost: 30000, expected_roi: 63, growth_duration: "100 days", water_requirement: "medium", difficulty_level: "medium" },
  ],

  // ===== DRYLAND/RAINFED REGIONS =====
  "rainfed_dryland": [
    { crop_name: "Pearl Millet (Bajra)", suitability_reason: "Most drought-adapted crop. Minimal external input. Food security. Climate change resilient. 4-8 quintals/hectare rainfed.", estimated_cost: 16000, expected_roi: 48, growth_duration: "95 days", water_requirement: "low", difficulty_level: "easy" },
    { crop_name: "Sorghum (Jowar)", suitability_reason: "Drought-tolerant. Deep-rooting accesses subsoil moisture. 8-12 quintals/hectare typical. Organic cultivation premium." , estimated_cost: 18000, expected_roi: 50, growth_duration: "100 days", water_requirement: "low", difficulty_level: "easy" },
    { crop_name: "Chickpea (Gram)", suitability_reason: "Winter rainfed specialist. Rabi moisture sufficient. 12-15 quintals/hectare potential. Pulse premium Rs 5000/quintal helps.", estimated_cost: 17000, expected_roi: 50, growth_duration: "110 days", water_requirement: "low", difficulty_level: "easy" },
    { crop_name: "Groundnut (Peanut)", suitability_reason: "Rainfed kharif crop. Deep-rooting. Soild improvement. 12-18 quintals/hectare rainfed. Risk mitigation through multi-crop.", estimated_cost: 21000, expected_roi: 54, growth_duration: "110 days", water_requirement: "low", difficulty_level: "easy" },
    { crop_name: "Mustard (Rapeseed)", suitability_reason: "Rabi rainfed crop. Post-monsoon moisture adequate. 8-12 quintals/hectare. Organic mustard premium market.", estimated_cost: 18500, expected_roi: 53, growth_duration: "110 days", water_requirement: "low", difficulty_level: "easy" },
  ],
};

export interface FarmData {
  location?: string;
  soilType?: string;
  farmSize?: number;
  sizeUnit?: string;
  budget?: number;
  waterAvailability?: string;
  irrigationType?: string;
  season?: string;
  purpose?: string;
}

export const getDemoCropRecommendations = (farmData?: FarmData | string): CropRecommendation[] => {
  // Handle both string location (legacy) and FarmData object
  if (typeof farmData === "string") {
    return cloneRecommendations(buildDemoRecommendations(undefined, undefined, undefined, undefined, farmData));
  }

  if (!farmData) {
    return cloneRecommendations(buildDemoRecommendations());
  }

  // Try to find extended demo data based on soil + water + season combination
  const soil = (farmData.soilType || "loamy").toLowerCase().trim();
  const water = (farmData.waterAvailability || "medium").toLowerCase().trim();
  const season = (farmData.season || "kharif").toLowerCase().trim();

  // Map water to water level
  const waterLevel = 
    water === "high" || water.includes("high") || water.includes("plenty") ? "high" :
    water === "low" || water.includes("low") || water.includes("limited") ? "low" :
    "medium";

  // Check various combinations in extended data
  const combinations = [
    `${soil}_${season}_${waterLevel}`, // specific: black_kharif_low
    `${soil}_${season}`, // fallback: black_kharif
    `${soil}_${waterLevel}`, // fallback: black_low
  ];

  for (const combo of combinations) {
    if (EXTENDED_DEMO_DATA[combo]) {
      return cloneRecommendations(EXTENDED_DEMO_DATA[combo]);
    }
  }

  // Check for generic categories
  if (water === "high" || waterLevel === "high") {
    if (EXTENDED_DEMO_DATA["irrigated_intensive"]) {
      return cloneRecommendations(EXTENDED_DEMO_DATA["irrigated_intensive"]);
    }
  }

  if (waterLevel === "low") {
    if (EXTENDED_DEMO_DATA["rainfed_dryland"]) {
      return cloneRecommendations(EXTENDED_DEMO_DATA["rainfed_dryland"]);
    }
  }

  // Default to regular rules-based recommendations WITH LOCATION
  return cloneRecommendations(
    buildDemoRecommendations(
      farmData.soilType,
      farmData.waterAvailability,
      farmData.season,
      farmData.budget,
      farmData.location  // Pass location here
    )
  );
};

// Helper function to get translated crop name
export const getTranslatedCropName = (cropKey: string, language: string = "en"): string => {
  const lang = language.toLowerCase() as "en" | "hi" | "bn";
  const translation = CROP_TRANSLATIONS[cropKey];
  
  if (!translation) {
    // Fallback: try to find by English name in CROP_PROFILES
    const profile = CROP_PROFILES[cropKey];
    return profile?.crop_name || cropKey;
  }
  
  return translation[lang] || translation.en;
};

// Helper function to translate crop recommendation
export const translateCropRecommendation = (
  recommendation: CropRecommendation,
  cropKey: string,
  language: string = "en"
): CropRecommendation => {
  return {
    ...recommendation,
    crop_name: getTranslatedCropName(cropKey, language),
    // Keep other fields as-is for now (can translate suitability_reason later if needed)
  };
};
