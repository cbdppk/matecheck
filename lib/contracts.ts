export type Vehicle = {
  id: string;
  plate: string;
  ownerName: string;
  route: string;
};

export type Trip = {
  id: string;
  vehicleId: string;
  amount: number;
  route: string;
  loggedAt: string;
  rawVoiceText?: string;
  confidence: "high" | "medium" | "low";
};

export type DailySummary = {
  vehicleId: string;
  date: string;
  total: number;
  tripCount: number;
  avgPerTrip: number;
  aiNote?: string;
  anomaly: boolean;
};

export type VoiceLogResponse = {
  success: boolean;
  trip?: Trip;
  confirmationTwi?: string;
  error?: string;
};

export type SummaryResponse = {
  summary: DailySummary;
  aiNoteTwi: string;
  aiNoteEn: string;
};

export type DisputeResponse = {
  analysisEn: string;
  analysisTwi: string;
  loggedTotal: number;
  claimedTotal: number;
  verdict: "matches" | "gap_explained" | "gap_unexplained";
};
