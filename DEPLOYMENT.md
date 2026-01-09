# Deployment Instrukcijos

## 1. Vercel Deployment (Rekomenduojama)

### Žingsniai:

1. **Sukurkite GitHub repository:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/jusu-username/myliu-app.git
   git push -u origin main
   ```

2. **Užsiregistruokite Vercel:**
   - Eikite į https://vercel.com
   - Prisijunkite su GitHub account
   - Spauskite "Add New Project"
   - Pasirinkite savo repository
   - Vercel automatiškai aptiks Vite ir sukonfigūruos

3. **Susiekite domeną:**
   - Vercel dashboard'e eikite į "Settings" → "Domains"
   - Pridėkite savo domeną
   - Vercel duos DNS įrašus
   - Pakeiskite DNS savo domeno provider'yje (pvz., Namecheap, GoDaddy)

## 2. Netlify Deployment

### Žingsniai:

1. **Sukurkite `netlify.toml` failą:**
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **Deploy:**
   - Eikite į https://netlify.com
   - Prisijunkite su GitHub
   - Drag & drop `dist` folder arba connect repository
   - Netlify automatiškai deploy'ins

## 3. Build komanda

Prieš deploy'inant, sukurkite production build:

```bash
npm run build
```

Tai sukurs `dist` folder su optimizuotu kodu.

## 4. Svarbu žinoti

### Dabar aplikacija:
- ✅ Veikia tik frontend'e
- ✅ Duomenys saugomi tik naršyklėje (state)
- ❌ Po perkrovimo duomenys dingsta
- ❌ Nėra tikros duomenų bazės
- ❌ Nėra tikros autentifikacijos

### Realiai reikės:
- Backend serverio (Node.js, Python, arba kitas)
- Duomenų bazės (MongoDB, PostgreSQL)
- Failų saugyklos (nuotraukoms)
- Mokėjimų sistemos (Stripe, PayPal)
- Email/SMS serviso (patvirtinimams)

## 5. Rekomendacijos

**Dabar (prototipas):**
- Vercel (nemokamas, lengvas)
- GitHub Pages (jei norite nemokamai)

**Vėliau (production):**
- Frontend: Vercel arba Netlify
- Backend: Railway, Render, arba DigitalOcean
- Duomenų bazė: MongoDB Atlas (nemokamas planas) arba Supabase
- Failai: Cloudinary arba AWS S3

## 6. Kaip veikia domenas

1. **Nusipirkite domeną** (pvz., `sixseven.lt`)
2. **Vercel/Netlify duos DNS įrašus:**
   - Type: CNAME
   - Name: @ arba www
   - Value: cname.vercel-dns.com (Vercel) arba panašus
3. **Pakeiskite DNS savo domeno provider'yje**
4. **Palaukite 24-48 valandas** (DNS propagacija)

## 7. SSL sertifikatas

Vercel ir Netlify automatiškai suteikia nemokamą SSL sertifikatą (HTTPS). Jums nieko daryti nereikia!


