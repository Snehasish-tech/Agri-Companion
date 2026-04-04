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

// Same CROP_PROFILES from edge function with enhanced descriptions
const CROP_PROFILES: Record<string, CropRecommendation> = {
  rice: { crop_name: "Rice", suitability_reason: "Staple crop suited for high water availability and monsoon season. Best for alluvial soils. Requires flooded fields and consistent moisture.", estimated_cost: 36000, expected_roi: 62, growth_duration: "120 days", water_requirement: "high", difficulty_level: "medium" },
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
};

// Same soil/water/season priorities from edge function
const SOIL_PRIORITY: Record<string, string[]> = {
  alluvial: ["rice", "wheat", "sugarcane", "maize", "mustard"],
  black: ["cotton", "soybean", "sorghum", "groundnut", "pigeonpea"],
  red: ["groundnut", "millet", "maize", "pigeonpea", "sunflower"],
  laterite: ["millet", "groundnut", "sorghum", "maize"],
  clay: ["rice", "wheat", "barley", "mustard", "onion"],
  loamy: ["tomato", "potato", "onion", "wheat", "maize"],
  sandy: ["groundnut", "millet", "mustard", "chickpea"],
  saline: ["barley", "mustard", "sorghum", "cotton", "sunflower"],
  alkaline: ["barley", "mustard", "chickpea", "cotton", "sorghum"],
  rocky: ["millet", "sorghum", "pigeonpea", "groundnut", "sunflower"],
  silty: ["rice", "wheat", "maize", "mustard", "potato"],
};

const WATER_PRIORITY: Record<string, string[]> = {
  low: ["millet", "sorghum", "chickpea", "mustard", "groundnut", "pigeonpea"],
  medium: ["wheat", "maize", "soybean", "tomato", "onion", "potato"],
  high: ["rice", "sugarcane", "cotton", "tomato", "potato"],
};

const SEASON_PRIORITY: Record<string, string[]> = {
  kharif: ["rice", "maize", "cotton", "soybean", "groundnut", "pigeonpea"],
  rabi: ["wheat", "chickpea", "mustard", "barley", "lentil", "potato"],
  zaid: ["maize", "groundnut", "tomato", "onion", "sunflower"],
};

const cloneRecommendations = (recommendations: CropRecommendation[]): CropRecommendation[] =>
  recommendations.map((item) => ({ ...item }));

// Build recommendations same way as edge function - DETERMINISTIC
const buildDemoRecommendations = (soilType?: string, waterAvailability?: string, season?: string, budget?: number): CropRecommendation[] => {
  const soil = (soilType || "loamy").toLowerCase().trim();
  const water = (waterAvailability || "medium").toLowerCase().trim();
  const seasonVal = (season || "kharif").toLowerCase().trim();
  const budgetVal = Math.max(0, budget || 0);

  // Same priority matching as edge function - DETERMINISTIC
  const candidates: string[] = [];
  
  // Add soil-matched crops first
  if (SOIL_PRIORITY[soil]) {
    candidates.push(...SOIL_PRIORITY[soil]);
  }
  
  // Then water-matched crops
  if (WATER_PRIORITY[water]) {
    for (const crop of WATER_PRIORITY[water]) {
      if (!candidates.includes(crop)) candidates.push(crop);
    }
  }
  
  // Then season-matched crops
  if (SEASON_PRIORITY[seasonVal]) {
    for (const crop of SEASON_PRIORITY[seasonVal]) {
      if (!candidates.includes(crop)) candidates.push(crop);
    }
  }
  
  // Fill remaining with default order
  const defaultOrder = ["rice", "wheat", "maize", "millet", "groundnut", "mustard", "tomato", "potato", "chickpea"];
  for (const crop of defaultOrder) {
    if (!candidates.includes(crop)) candidates.push(crop);
  }

  // Filter by budget if specified
  let filtered = candidates;
  if (budgetVal > 0) {
    filtered = candidates.filter((cropName) => {
      const profile = CROP_PROFILES[cropName];
      return profile && profile.estimated_cost <= budgetVal * 1.5; // 50% budget flexibility
    });
    // If filtering removes all, use all candidates
    if (filtered.length === 0) filtered = candidates;
  }

  // Take top 5
  const picked = filtered.slice(0, 5);

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
    return cloneRecommendations(buildDemoRecommendations());
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

  // Default to regular rules-based recommendations
  return cloneRecommendations(
    buildDemoRecommendations(
      farmData.soilType,
      farmData.waterAvailability,
      farmData.season,
      farmData.budget
    )
  );
};
