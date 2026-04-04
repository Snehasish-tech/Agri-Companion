import { describe, expect, it } from "vitest";
import { getDemoCropRecommendations, type FarmData } from "@/lib/demoData";

describe("demo recommendation determinism", () => {
  const input: FarmData = {
    soilType: "black",
    waterAvailability: "low",
    season: "kharif",
    budget: 50000,
  };

  it("returns same recommendations for same input", () => {
    const first = getDemoCropRecommendations(input);
    const second = getDemoCropRecommendations({ ...input });

    expect(first).toEqual(second);
  });

  it("does not leak mutation across calls", () => {
    const first = getDemoCropRecommendations(input);
    first[0].crop_name = "Mutated";

    const second = getDemoCropRecommendations(input);
    expect(second[0].crop_name).not.toBe("Mutated");
  });
});
