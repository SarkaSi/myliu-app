# Kur rasti GitHub duomenis

## 1. GitHub Username (Vartotojo vardas)

**Kur rasti:**
1. Eikite į [github.com](https://github.com) ir prisijunkite
2. Viršutiniame dešiniame kampe spauskite ant savo profilio nuotraukos/avatar
3. Spauskite "Your profile"
4. Jūsų **username** bus URL adrese: `https://github.com/JUSU_USERNAME`
   - Pavyzdys: jei URL `https://github.com/jonas-petras`, tai username = `jonas-petras`
5. Arba tiesiog pažiūrėkite viršutiniame dešiniame kampe - ten bus jūsų username

## 2. Repository URL (jei jau turite sukurtą repository)

**Jei repository JAU EGZISTUOJA:**
1. Eikite į [github.com](https://github.com)
2. Viršuje spauskite ant savo profilio → "Your repositories"
3. Pasirinkite repository (arba sukurkite naują)
4. Repository puslapyje spauskite žalią mygtuką "Code"
5. Ten pamatysite URL:
   - **HTTPS:** `https://github.com/jusu-username/repository-name.git`
   - **SSH:** `git@github.com:jusu-username/repository-name.git`
6. Nukopijuokite HTTPS URL (jei naudojate username/password arba GitHub token)

**Jei repository DAR NEKURTAS:**
- Tada tiesiog reikia **username**, ir mes sukursime repository URL automatiškai
- Formatas bus: `https://github.com/JUSU_USERNAME/myliu-app.git`

## 3. GitHub Token (jei naudojate 2FA arba reikia)

Jei turite įjungtą Two-Factor Authentication (2FA):
1. GitHub → Settings (viršuje dešinėje, profilio meniu)
2. Kairėje pusėje → "Developer settings"
3. "Personal access tokens" → "Tokens (classic)"
4. "Generate new token (classic)"
5. Pasirinkite scopes: `repo` (visi)
6. Nukopijuokite token (jį pamatysite tik kartą!)

**SVARBU:** Jei neturite 2FA, token gali ir nereikėti - galite naudoti GitHub username ir password.

---

## Kas man reikia iš jūsų:

**MINIMUM reikia:**
- ✅ GitHub **username** (pvz. `jonas-petras`)

**OPTIONAL (jei jau turite repository):**
- Repository **URL** (pvz. `https://github.com/jonas-petras/myliu-app.git`)

**Arba galiu pats patikrinti:**
- Pasakykite tik **username**, ir aš patikrinsiu ar jau yra repository, arba padėsiu sukurti naują!

---

## Greitas būdas patikrinti username:

1. Atidarykite [github.com](https://github.com)
2. Prisijunkite
3. Pažiūrėkite viršutinį dešinį kampą - ten bus jūsų username arba avatar
4. Arba spauskite ant avatar → "Your profile" → pažiūrėkite URL
