# SKILL: ghana-nlp-integration

## Purpose
Integrate GhanaNLP APIs for Twi speech recognition (ASR) and text-to-speech (TTS) and translation.

## Use when
- Processing voice input from drivers (ASR: speech → Twi text)
- Generating audio confirmations for drivers (TTS: Twi text → audio)
- Translating English → Twi or Twi → English for the dispute resolver

## Inputs
- GHANA_NLP_API_KEY from process.env
- GhanaNLP base URL: https://translation.ghananlp.org/v1/

## API reference

### ASR (Speech to Text)
```
POST https://translation.ghananlp.org/v1/asr
Headers:
  Ocp-Apim-Subscription-Key: [API_KEY]
  Content-Type: multipart/form-data
Body:
  file: [audio blob]
  language: "tw"  (Twi/Akan)
Response: { transcript: "..." }
```

### TTS (Text to Speech)
```
POST https://translation.ghananlp.org/v1/tts
Headers:
  Ocp-Apim-Subscription-Key: [API_KEY]
  Content-Type: application/json
Body: { "text": "...", "language": "tw" }
Response: base64 audio string
```

### Translate
```
POST https://translation.ghananlp.org/v1/translate
Headers:
  Ocp-Apim-Subscription-Key: [API_KEY]
  Content-Type: application/json
Body: { "in": "en", "out": "tw", "sentence": "..." }
Response: { translation: "..." }
```

## Standards
- Always wrap GhanaNLP calls in try/catch
- If GhanaNLP fails, the feature degrades gracefully — the app still works
- Never block a DB insert on a GhanaNLP failure
- Log GhanaNLP errors to console but do not surface them to the user as crashes

## Process
1. Check GHANA_NLP_API_KEY is available before calling
2. Make the API call
3. On success: use the result
4. On failure: log and proceed with fallback (text input, no audio, English only)

## Output
- Twi transcript string from ASR
- Base64 audio from TTS (to be played with new Audio(dataUrl).play())
- Translated string from Translate endpoint

## Do not
- Block the main flow on GhanaNLP failures
- Expose the raw API error to the user
- Store audio blobs in the DB — only store transcripts
- Assume the API key format — read docs at translation.ghananlp.org/apis
