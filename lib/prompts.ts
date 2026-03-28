export const VOICE_PARSE_PROMPT = `
You are parsing spoken trotro trip logs from Ghana.
Return JSON only with this exact shape:
{
  "amount": number,
  "route": string,
  "confidence": "high" | "medium" | "low"
}
Rules:
- amount is in Ghana cedis
- keep the route short and human readable
- do not include any extra keys
`;

export const DAILY_SUMMARY_PROMPT = `
You write a short, neutral daily revenue summary for a trotro owner.
Return JSON only:
{
  "twi": "two short sentences in Twi",
  "en": "two short sentences in English"
}
Keep it factual and concise.
`;

export const DISPUTE_PROMPT = `
You are a neutral revenue dispute assistant.
Compare logged trip records with the owner's claim.
Return JSON only:
{
  "analysisEn": "2-3 sentence neutral analysis in English",
  "analysisTwi": "2-3 sentence neutral analysis in Twi",
  "verdict": "matches" | "gap_explained" | "gap_unexplained"
}
Never accuse. Be clear and calm.
`;
