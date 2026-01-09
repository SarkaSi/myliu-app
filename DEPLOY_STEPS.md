# Deploy Instrukcijos - SarkaSi GitHub

## Jūsų GitHub informacija:
- **Username:** SarkaSi
- **Repository URL (bus):** `https://github.com/SarkaSi/myliu-app.git`

---

## ŽINGSNIS 1: Konfigūruokite Git

Vykdykite šias komandas (pakeiskite email į savo GitHub email):

```bash
git config --global user.name "SarkaSi"
git config --global user.email "jusu.github.email@example.com"
```

**Kur rasti GitHub email:**
- GitHub.com → Settings (viršuje dešinėje, profilio meniu)
- Kairėje pusėje → "Emails"
- Ten pamatysite jūsų email

---

## ŽINGSNIS 2: Pridėkite failus ir sukurkite commit

```bash
cd "C:\Users\maini\Desktop\Cursor Myliu\myliu-app"
git add .
git commit -m "Initial commit: Myliu pazintys platform"
```

---

## ŽINGSNIS 3: Sukurkite Repository GitHub'e

### Per GitHub.com (GREITAS BŪDAS):

1. **Eikite į:** https://github.com/new
2. **Užpildykite:**
   - **Repository name:** `myliu-app`
   - **Description:** (neprivaloma) "Pažintys platforma - Myliu app"
   - **Public** arba **Private** (pasirinkite)
   - **SVARBU:** NEŽYMĖKITE:
     - ❌ "Add a README file"
     - ❌ "Add .gitignore" 
     - ❌ "Choose a license"
   - (Mes jau turime visus failus!)
3. **Spauskite:** "Create repository"

### Po repository sukūrimo:

GitHub parodys puslapį su instrukcijomis "push an existing repository". **NEVYKDYKITE** tų komandų dabar - aš paruošiu tinkamas komandas žemiau.

---

## ŽINGSNIS 4: Pridėkite Remote ir Push'inkite

Po to, kai sukūrėte repository GitHub'e, vykdykite:

```bash
# Pridėkite GitHub repository kaip remote
git remote add origin https://github.com/SarkaSi/myliu-app.git

# Patikrinkite kad remote pridėtas
git remote -v

# Nustatykite main branch
git branch -M main

# Push'inkite kodą į GitHub
git push -u origin main
```

**Jei prašys GitHub username ir password:**
- Username: `SarkaSi`
- Password: Naudokite **Personal Access Token** (ne tikrą password!)

**Kur gauti Personal Access Token:**
1. GitHub.com → Settings → Developer settings
2. Personal access tokens → Tokens (classic)
3. Generate new token (classic)
4. Pasirinkite: `repo` (visi repository permissions)
5. Generate token
6. **Nukopijuokite token** (pamatysite tik kartą!)

---

## ŽINGSNIS 5: Deploy į Vercel

### Per Vercel Dashboard (REKOMENDUOJAMA):

1. **Eikite į:** https://vercel.com
2. **Spauskite:** "Sign Up" arba "Log In"
3. **Prisijunkite su GitHub** (spauskite "Continue with GitHub")
4. **Autorizuokite Vercel** prieigą prie GitHub
5. **Spauskite:** "Add New Project"
6. **Pasirinkite repository:** `SarkaSi/myliu-app`
7. **Vercel automatiškai aptiks Vite projektą:**
   - Framework Preset: **Vite**
   - Build Command: `npm run build` (automatiškai)
   - Output Directory: `dist` (automatiškai)
8. **Spauskite:** "Deploy"
9. **Po 1-2 minučių gausite live URL!** 🎉

### Arba per Vercel CLI:

```bash
# Įdiekite Vercel CLI
npm i -g vercel

# Prisijunkite
vercel login

# Deploy
vercel

# Production deploy
vercel --prod
```

---

## ✅ Kas bus po deploy:

- ✅ Nemokamas hosting su HTTPS
- ✅ Global CDN (greitas greitis)
- ✅ Automatinis deploy po kiekvieno `git push`
- ✅ Preview deployments kiekvienam branch
- ✅ Custom domain galimybė

---

## 🆘 Jei kyla problemų:

### Problema: "Authentication failed"
**Sprendimas:** Naudokite Personal Access Token vietoj password

### Problema: "Repository not found"
**Sprendimas:** Patikrinkite ar repository pavadinimas `myliu-app` tiksliai atitinka GitHub'e

### Problema: "Permission denied"
**Sprendimas:** Patikrinkite ar token turi `repo` permissions

---

## 📞 Reikia pagalbos?

Jei kyla problemų su bet kuriuo žingsniu, pasakykite kur sustojote ir padėsiu!
