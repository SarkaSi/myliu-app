# ChatGPT + Nuotraukų Generavimo Integracija

Šis projektas dabar palaiko hibridinį nuotraukų generavimo sprendimą:
- **ChatGPT** - generuoja detalių prompts
- **Stable Diffusion** - generuoja nuotraukas (esamas sprendimas)
- **DALL-E** - alternatyvus nuotraukų generavimo būdas

---

## 📋 Reikalingi Komponentai

### 1. OpenAI API Key

1. **Eikite į:** [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. **Prisijunkite** arba **sukurkite paskyrą**
3. **Spustelėkite** "Create new secret key"
4. **Nukopijuokite** API key (jis bus rodomas tik vieną kartą!)

### 2. Python Bibliotekos

Įdiekite reikalingas bibliotekas:

```bash
pip install -r requirements.txt
```

Arba rankiniu būdu:

```bash
pip install openai requests
```

### 3. Konfigūracija

Sukurkite `.env` failą projekto šaknyje (jei dar nėra):

```bash
# Nukopijuokite .env.example į .env
cp .env.example .env
```

Redaguokite `.env` failą ir įdėkite savo OpenAI API key:

```bash
OPENAI_API_KEY=sk-...your-actual-api-key-here...
```

**SVARBU:** `.env` failas jau yra `.gitignore`, todėl jūsų API key nebus commit'intas.

---

## 🚀 Naudojimas

### Variantas 1: ChatGPT Prompts + Stable Diffusion (Rekomenduojama)

Naudoja ChatGPT generuoti geresnius prompts, o Stable Diffusion generuoja nuotraukas:

```bash
python generate_with_chatgpt.py \
  --member-name "domantas" \
  --scenarios \
    "mountain hiking adventure morning" \
    "camping at night with campfire" \
    "fishing at lake afternoon" \
    "forest exploration morning" \
    "mountain climbing afternoon" \
    "wilderness outdoor afternoon"
```

### Variantas 2: DALL-E (Alternatyva)

Naudoja DALL-E API tiesiogiai nuotraukų generavimui:

```bash
python generate_with_chatgpt.py \
  --use-dalle \
  --member-name "domantas" \
  --scenarios \
    "mountain hiking adventure morning" \
    "camping at night with campfire"
```

**Pastaba:** DALL-E yra brangesnis, bet generuoja aukštesnės kokybės nuotraukas.

---

## 📝 Pavyzdys: Pilnas Naudojimas

### 1. Sukurkite `.env` failą:

```bash
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 2. Įdiekite bibliotekas:

```bash
pip install -r requirements.txt
```

### 3. Paleiskite generavimą:

```bash
python generate_with_chatgpt.py \
  --member-name "amber" \
  --base-seed 14000 \
  --scenarios \
    "winter coat in snow during deep Lithuanian winter" \
    "spring dress surrounded by blooming flowers" \
    "casual summer outfit walking on street" \
    "autumn fashion sitting in cafe" \
    "cozy winter sweater indoors" \
    "light spring clothes outdoor"
```

### 4. Rezultatai:

Nuotraukos bus išsaugotos `generated_photos/` kataloge:
- `amber_winter_coat_in_snow_during_deep_lithuanian_winter.png`
- `amber_spring_dress_surrounded_by_blooming_flowers.png`
- ir t.t.

---

## ⚙️ Funkcijos

### ChatGPT Prompt Generavimas

- **Modelis:** `gpt-4o-mini` (pigus, bet efektyvus)
- **Temperatūra:** 0.7 (kūrybiškas, bet kontroliuojamas)
- **Maksimalus tokenų skaičius:** 500

ChatGPT generuoja detalių prompts, kurie:
- Yra labai detalūs ir specifiniai
- Fokusuojasi į realistinę fotografiją
- Apima apšvietimą, kompoziciją, sceną
- Pabrėžia natūralius netobulumus
- Vengia AI art stiliaus

### Stable Diffusion Integracija

- Naudoja esamą Stable Diffusion API (`http://127.0.0.1:7860`)
- Automatiškai randa geriausią checkpoint modelį
- Naudoja ADetailer face enhancement
- Generuoja 512x768 rezoliucijos nuotraukas

### DALL-E Integracija

- Naudoja `dall-e-3` modelį
- Generuoja 1024x1024 rezoliucijos nuotraukas
- Standartinė kokybė (galima pakeisti į "hd")
- Brangesnis, bet aukštesnės kokybės

---

## 💰 Kainos

### ChatGPT (Prompt Generavimas)

- **gpt-4o-mini:** ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens
- **Vienas prompt:** ~$0.001-0.002 (labai pigus)

### DALL-E

- **DALL-E 3 (1024x1024, standard):** $0.040 per nuotrauką
- **DALL-E 3 (1024x1024, HD):** $0.080 per nuotrauką

### Stable Diffusion

- **Nemokamai** (jei turite vietinį serverį)
- Arba naudokite cloud servisus (įvairūs kainodaros)

---

## 🔧 Troubleshooting

### Problema: "OpenAI API key not found"

**Sprendimas:**
1. Patikrinkite, ar `.env` failas yra projekto šaknyje
2. Patikrinkite, ar `OPENAI_API_KEY` yra nustatytas
3. Patikrinkite, ar API key yra teisingas (prasideda su `sk-`)

### Problema: "Stable Diffusion API is not available"

**Sprendimas:**
1. Įsitikinkite, kad Stable Diffusion serveris veikia: `http://127.0.0.1:7860`
2. Patikrinkite, ar serveris atsako: atidarykite naršyklėje `http://127.0.0.1:7860`

### Problema: ChatGPT generuoja per trumpus prompts

**Sprendimas:**
Redaguokite `generate_with_chatgpt.py`:
- Padidinkite `max_tokens` (dabar 500)
- Pakeiskite `temperature` (dabar 0.7)

### Problema: DALL-E generuoja per lėtai

**Sprendimas:**
- DALL-E API gali užtrukti 10-30 sekundžių
- Tai normalus laikas aukštos kokybės nuotraukoms

---

## 📚 Naudingos Nuorodos

- **OpenAI API Keys:** [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- **OpenAI Dokumentacija:** [https://platform.openai.com/docs](https://platform.openai.com/docs)
- **OpenAI Pricing:** [https://openai.com/pricing](https://openai.com/pricing)
- **DALL-E Dokumentacija:** [https://platform.openai.com/docs/guides/images](https://platform.openai.com/docs/guides/images)

---

## ✅ Patikra

Patikrinkite, ar turite:

- [ ] OpenAI API key (`.env` faile)
- [ ] Įdiegtas `openai` Python paketas (`pip install openai`)
- [ ] Įdiegtas `requests` Python paketas (`pip install requests`)
- [ ] Stable Diffusion serveris veikia (jei naudojate Stable Diffusion)
- [ ] Ištestuotas generavimas su vienu scenarijumi

---

**Pastaba:** ChatGPT negali tiesiogiai generuoti nuotraukų - jis generuoja tik prompts. Nuotraukoms naudojame Stable Diffusion arba DALL-E API.
