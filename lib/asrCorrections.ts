/**
 * ASR post-correction layer.
 *
 * GhanaNLP transcription produces phonetic approximations of Ghanaian place names
 * and Twi/pidgin numbers. This module applies ordered, deterministic find-and-replace
 * rules to the raw transcript BEFORE it reaches Claude, so the LLM only sees clean text.
 *
 * Rule ordering matters:
 *   1. Merged tokens (e.g. "sebisedis" = "sebi" + "cedis" run together) — split first
 *   2. Currency markers normalised to "cedis"
 *   3. Number words → digits
 *   4. Place name phonetic corrections
 */

type Rule = { pattern: RegExp; replacement: string };

// ── 1. Merged number+currency tokens ──────────────────────────────────────────
// ASR sometimes fuses the number word and the currency word into one token.
// Expand them before other rules run.
const MERGED_AMOUNT_RULES: Rule[] = [
  { pattern: /\bsebisedis\b/gi,   replacement: "7 cedis" },
  { pattern: /\bsebicedis\b/gi,   replacement: "7 cedis" },
  { pattern: /\bsebemcedis\b/gi,  replacement: "7 cedis" },
  { pattern: /\bsebemseadis\b/gi, replacement: "7 cedis" },
  { pattern: /\btoontisidis\b/gi, replacement: "2 cedis" },
  { pattern: /\btooceadis\b/gi,   replacement: "2 cedis" },
  { pattern: /\btoocedis\b/gi,    replacement: "2 cedis" },
  { pattern: /\bfaifucedis\b/gi,  replacement: "5 cedis" },
  { pattern: /\bfaivceadis\b/gi,  replacement: "5 cedis" },
  { pattern: /\bfaivcedis\b/gi,   replacement: "5 cedis" },
  { pattern: /\basisedis\b/gi,    replacement: "6 cedis" },
  { pattern: /\basiacedis\b/gi,   replacement: "6 cedis" },
  { pattern: /\bntweceadis\b/gi,  replacement: "8 cedis" },
  { pattern: /\bntwecedis\b/gi,   replacement: "8 cedis" },
];

// ── 2. Currency marker normalisation ──────────────────────────────────────────
const CURRENCY_RULES: Rule[] = [
  { pattern: /\bntisidis\b/gi,    replacement: "cedis" },
  { pattern: /\bseadis\b/gi,      replacement: "cedis" },
  { pattern: /\bsidis\b/gi,       replacement: "cedis" },
  { pattern: /\bceadis\b/gi,      replacement: "cedis" },
  // "sedis" / "sedisi" / "sedise" / "sidisi" — GhanaNLP phonetic variants of "cedis"
  { pattern: /\bsedise\b/gi,      replacement: "cedis" },
  { pattern: /\bsedisi\b/gi,      replacement: "cedis" },
  { pattern: /\bsedis\b/gi,       replacement: "cedis" },
  { pattern: /\bsidisi\b/gi,      replacement: "cedis" },
  { pattern: /\bghana\s+cedis?\b/gi, replacement: "cedis" },
  { pattern: /\bghc\b/gi,         replacement: "cedis" },
  { pattern: /\bghs\b/gi,         replacement: "cedis" },
];

// ── 3. Number words → digits ───────────────────────────────────────────────────
// Context-sensitive rules use a lookahead for currency markers so common Twi
// words aren't replaced when they appear as part of a place name or sentence.
const CURRENCY_CTX = "(?=\\s*(?:cedis?|ceadis|seadis|sidis|ntisidis|ghana|ghc|ghs))";

const NUMBER_RULES: Rule[] = [
  // 1
  { pattern: /\bbaako\b/gi,   replacement: "1" },
  { pattern: /\bɛkɔ\b/gi,    replacement: "1" },
  { pattern: /\beko\b/gi,     replacement: "1" },
  // 2
  { pattern: /\babien\b/gi,   replacement: "2" },
  { pattern: /\bmmienu\b/gi,  replacement: "2" },
  { pattern: /\bntoo\b/gi,    replacement: "2" },
  // "too" / "tu" only when directly before a currency marker (avoid replacing "to" preposition)
  { pattern: new RegExp(`\\btoo\\b${CURRENCY_CTX}`, "gi"), replacement: "2" },
  { pattern: new RegExp(`\\btu\\b${CURRENCY_CTX}`, "gi"),  replacement: "2" },
  // 3
  { pattern: /\babiesa\b/gi,  replacement: "3" },
  { pattern: /\babiɛsa\b/gi,  replacement: "3" },
  { pattern: new RegExp(`\\bnsa\\b${CURRENCY_CTX}`, "gi"),  replacement: "3" },
  { pattern: new RegExp(`\\btri\\b${CURRENCY_CTX}`, "gi"),  replacement: "3" },
  { pattern: new RegExp(`\\btre\\b${CURRENCY_CTX}`, "gi"),  replacement: "3" },
  // 4
  { pattern: /\banan\b/gi,    replacement: "4" },
  { pattern: /\bnnan\b/gi,    replacement: "4" },
  { pattern: new RegExp(`\\bfo\\b${CURRENCY_CTX}`, "gi"),   replacement: "4" },
  { pattern: new RegExp(`\\bfoa\\b${CURRENCY_CTX}`, "gi"),  replacement: "4" },
  // 5
  { pattern: /\benum\b/gi,    replacement: "5" },
  { pattern: /\bɛnum\b/gi,    replacement: "5" },
  { pattern: /\bfaifu\b/gi,   replacement: "5" },
  { pattern: /\bfaiv\b/gi,    replacement: "5" },
  { pattern: /\bfayf\b/gi,    replacement: "5" },
  { pattern: /\bfaei\b/gi,    replacement: "5" },  // "faei sedisi" → 5 cedis
  { pattern: new RegExp(`\\bfai\\b${CURRENCY_CTX}`, "gi"),  replacement: "5" },
  { pattern: new RegExp(`\\bfae\\b${CURRENCY_CTX}`, "gi"),  replacement: "5" },  // "fae sidisi"
  // 6
  { pattern: /\bnsia\b/gi,    replacement: "6" },
  { pattern: /\bsikis\b/gi,   replacement: "6" },
  { pattern: new RegExp(`\\basia\\b${CURRENCY_CTX}`, "gi"), replacement: "6" },
  { pattern: new RegExp(`\\bses\\b${CURRENCY_CTX}`, "gi"),  replacement: "6" },
  { pattern: new RegExp(`\\bsies\\b${CURRENCY_CTX}`, "gi"), replacement: "6" },
  // 7
  { pattern: /\bason\b/gi,    replacement: "7" },
  { pattern: /\bnson\b/gi,    replacement: "7" },
  { pattern: /\bsebi\b/gi,    replacement: "7" },
  { pattern: /\bseben\b/gi,   replacement: "7" },
  { pattern: /\bsebem\b/gi,   replacement: "7" },
  // 8
  { pattern: /\bawɔtwe\b/gi,  replacement: "8" },
  { pattern: /\bawotwɛ\b/gi,  replacement: "8" },
  { pattern: /\bntwe\b/gi,    replacement: "8" },
  { pattern: new RegExp(`\\beit\\b${CURRENCY_CTX}`, "gi"),  replacement: "8" },
  // 9
  { pattern: /\bakron\b/gi,   replacement: "9" },
  { pattern: /\bnkron\b/gi,   replacement: "9" },
  { pattern: /\bnain\b/gi,    replacement: "9" },
  { pattern: /\bnayn\b/gi,    replacement: "9" },
  // 10
  { pattern: /\bedu\b/gi,     replacement: "10" },
  { pattern: new RegExp(`\\bdu\\b${CURRENCY_CTX}`, "gi"),   replacement: "10" },
  // 13 — GhanaNLP phonetic forms of English "thirteen"
  // "ɛatim" / "atim" heard as "thirteen"; "ɛyɛtin" / "yɛtin" as another phonetic
  { pattern: /\bɛatim\b/gi,   replacement: "13" },
  { pattern: /\bɛyɛtin\b/gi,  replacement: "13" },
  { pattern: new RegExp(`\\batim\\b${CURRENCY_CTX}`, "gi"),  replacement: "13" },
  { pattern: new RegExp(`\\byɛtin\\b${CURRENCY_CTX}`, "gi"), replacement: "13" },
  // 20
  { pattern: /\baduonu\b/gi,  replacement: "20" },
  { pattern: /\btwenti\b/gi,  replacement: "20" },
  // 30
  { pattern: /\baduasa\b/gi,  replacement: "30" },
  // 40
  { pattern: /\baduanan\b/gi, replacement: "40" },
  // 50
  { pattern: /\baduonum\b/gi, replacement: "50" },
];

// ── 4. Place name phonetic corrections ────────────────────────────────────────
const PLACE_RULES: Rule[] = [
  // Tech (KNUST area, Kumasi)
  { pattern: /\bdeka\b/gi,                         replacement: "Tech" },
  { pattern: /\bteka\b/gi,                         replacement: "Tech" },
  { pattern: /\bteg\b/gi,                          replacement: "Tech" },
  { pattern: /\btek\b/gi,                          replacement: "Tech" },

  // Adum
  { pattern: /\btubu\b/gi,                         replacement: "Adum" },
  { pattern: /\bdubu\b/gi,                         replacement: "Adum" },

  // Effiduasi
  { pattern: /\bfigirase\b/gi,                     replacement: "Effiduasi" },
  { pattern: /\befigiras\w*/gi,                    replacement: "Effiduasi" },
  { pattern: /\befiduas\w*/gi,                     replacement: "Effiduasi" },
  { pattern: /\bfiduase\b/gi,                      replacement: "Effiduasi" },

  // Maxima
  { pattern: /\bmagsima\b/gi,                      replacement: "Maxima" },
  { pattern: /\bmaksima\b/gi,                      replacement: "Maxima" },
  { pattern: /\bmagsema\b/gi,                      replacement: "Maxima" },

  // Angola (Kumasi bus station — also heard as Anloga/Angloga Junction)
  { pattern: /\banor\)?ga\w*/gi,                   replacement: "Angola" },
  { pattern: /\banorgagyan\w*/gi,                  replacement: "Angola" },
  { pattern: /\bangloga\s+junction\b/gi,           replacement: "Angola" },
  { pattern: /\banloga\s+junction\b/gi,            replacement: "Angola" },
  { pattern: /\bangloga\b/gi,                      replacement: "Angola" },
  { pattern: /\banloga\b/gi,                       replacement: "Angola" },

  // Santase
  { pattern: /\bsanta\s+ase\b/gi,                 replacement: "Santase" },
  { pattern: /\bsantaase\b/gi,                     replacement: "Santase" },

  // Tanoso
  { pattern: /\bta\s+no\s+so\b/gi,                replacement: "Tanoso" },
  { pattern: /\btano\s+so\b/gi,                    replacement: "Tanoso" },
  { pattern: /\btamaso\b/gi,                        replacement: "Tanoso" },

  // Ejisu
  { pattern: /\begyeso\b/gi,                       replacement: "Ejisu" },
  { pattern: /\bejeso\b/gi,                        replacement: "Ejisu" },
  { pattern: /\begyesu\b/gi,                       replacement: "Ejisu" },
  { pattern: /\begyezo\b/gi,                       replacement: "Ejisu" },

  // Abuakwa (Kumasi)
  { pattern: /\bebua\s+kwa\b/gi,                   replacement: "Abuakwa" },
  { pattern: /\bɛbuakwa\b/gi,                      replacement: "Abuakwa" },
  { pattern: /\bebuakwa\b/gi,                      replacement: "Abuakwa" },
  { pattern: /\bbuakwa\b/gi,                       replacement: "Abuakwa" },

  // Makro (wholesale market stop, Kumasi/Accra)
  { pattern: /\bmmaakuu\b/gi,                      replacement: "Makro" },
  { pattern: /\bmaakro\b/gi,                       replacement: "Makro" },
  { pattern: /\bmaako\b/gi,                        replacement: "Makro" },
  { pattern: /\bmaaku\b/gi,                        replacement: "Makro" },
];

// ── Public API ────────────────────────────────────────────────────────────────

export type CorrectionLog = { original: string; corrected: string };

/**
 * Apply all ASR correction rules to a raw transcript.
 * Returns the cleaned string and a log entry if anything changed.
 */
export function correctAsrText(raw: string): { text: string; log: CorrectionLog | null } {
  let text = raw;

  const applyRules = (rules: Rule[]) => {
    for (const { pattern, replacement } of rules) {
      text = text.replace(pattern, replacement);
    }
  };

  applyRules(MERGED_AMOUNT_RULES);
  applyRules(CURRENCY_RULES);
  applyRules(NUMBER_RULES);
  applyRules(PLACE_RULES);

  const changed = text !== raw;
  return {
    text,
    log: changed ? { original: raw, corrected: text } : null,
  };
}
