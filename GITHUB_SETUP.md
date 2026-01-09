# GitHub Repository Sukūrimas

## 1. Konfigūruokite Git (jei dar nepadaryta)

```bash
git config --global user.name "Jūsų Vardas"
git config --global user.email "jusu.email@example.com"
```

Arba tik šiam projektui (be `--global`):
```bash
git config user.name "Jūsų Vardas"
git config user.email "jusu.email@example.com"
```

## 2. Pridėkite failus į Git

```bash
cd "C:\Users\maini\Desktop\Cursor Myliu\myliu-app"
git add .
git commit -m "Initial commit: Myliu pazintys platform"
```

## 3. Sukurkite GitHub Repository

### Būdas 1: Per GitHub.com (Rekomenduojama)

1. Eikite į [github.com](https://github.com) ir prisijunkite
2. Spauskite **"+"** viršuje dešinėje → **"New repository"**
3. Užpildykite formą:
   - **Repository name:** `myliu-app` (arba bet koks kitas pavadinimas)
   - **Description:** (neprivaloma) "Pažintys platforma"
   - **Public** arba **Private** (pasirinkite)
   - **NEŽYMĖKITE** "Add a README file" (mes jau turime)
   - **NEŽYMĖKITE** "Add .gitignore" (mes jau turime)
   - **NEŽYMĖKITE** "Choose a license"
4. Spauskite **"Create repository"**
5. GitHub parodys instrukcijas - **NENAUDOKITE** "Quick setup", o naudokite "push an existing repository"

### Būdas 2: Per GitHub CLI (jei turite)

```bash
gh repo create myliu-app --public --source=. --remote=origin --push
```

## 4. Pridėkite Remote ir Push'inkite kodą

Po to, kai sukūrėte repository GitHub'e, gausite URL (pvz. `https://github.com/jusu-username/myliu-app.git`).

Tada vykdykite:

```bash
# Pridėkite GitHub repository kaip remote
git remote add origin https://github.com/jusu-username/myliu-app.git

# Arba jei naudojate SSH:
# git remote add origin git@github.com:jusu-username/myliu-app.git

# Patikrinkite remote
git remote -v

# Push'inkite kodą į GitHub
git branch -M main
git push -u origin main
```

## 5. Patikrinkite GitHub'e

Eikite į jūsų repository puslapį GitHub'e ir patikrinkite, ar visi failai yra ten.

## Repository URL

Kai sukursite repository, jūsų URL bus:
```
https://github.com/jusu-username/myliu-app
```

## Po to - Deploy į Vercel

Kai kodas yra GitHub'e, galite:
1. Eiti į [vercel.com](https://vercel.com)
2. Prisijungti su GitHub
3. Pasirinkti jūsų repository
4. Deploy!

Arba naudokite Vercel CLI:
```bash
vercel
```

---

**SVARBU:** 
- Jei naudojate Private repository, Vercel reikės prieigos prie GitHub
- Public repository - automatiškai veikia
- Kiekvienas push į `main` branch automatiškai deploy'ina į Vercel production
