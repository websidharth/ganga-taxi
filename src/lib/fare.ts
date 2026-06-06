export type FareInput = {
  estimatedKm: number;
  passengersCount: number;
  luggageItemsCount: number;
  totalLuggageWeightKg: number;
};

export type FareBreakdown = {
  baseFare: number;
  distanceFare: number;
  passengerSurcharge: number;
  luggageSurcharge: number;
  totalFare: number;
};

const round2 = (value: number) => Math.round(value * 100) / 100;

export function calculateFare(input: FareInput): FareBreakdown {
  const baseFare = 80;
  const distanceFare = input.estimatedKm * 18;
  const passengerSurcharge = Math.max(input.passengersCount - 1, 0) * 25;
  const luggageSurcharge = input.luggageItemsCount * 20 + input.totalLuggageWeightKg * 3;

  return {
    baseFare: round2(baseFare),
    distanceFare: round2(distanceFare),
    passengerSurcharge: round2(passengerSurcharge),
    luggageSurcharge: round2(luggageSurcharge),
    totalFare: round2(baseFare + distanceFare + passengerSurcharge + luggageSurcharge)
  };
}
