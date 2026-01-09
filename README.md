# React + Vite - Pažintys Platform

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## 🚀 Deploy į Vercel

Projektas paruoštas deploy'ui į Vercel. Yra du būdai:

### Būdas 1: Per Vercel Dashboard (Rekomenduojama)

1. Eikite į [vercel.com](https://vercel.com) ir prisijunkite su GitHub/GitLab/Bitbucket
2. Spauskite "Add New Project"
3. Pasirinkite šį repository
4. Vercel automatiškai aptiks Vite projektą
5. Build Settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build` (automatiškai)
   - **Output Directory:** `dist` (automatiškai)
6. Spauskite "Deploy"
7. Po kelių minučių gausite live URL!

### Būdas 2: Per Vercel CLI

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

### Automatinis Deploy

Kai projektas prijungtas prie Vercel:
- Kiekvienas push į `main` branch automatiškai deploy'ina į production
- Kiekvienas push į kitus branch'us sukuria preview deployment
- Vercel automatiškai build'ina ir deploy'ina po kiekvieno commit

### Svarbu

- ✅ `vercel.json` jau sukonfigūruotas
- ✅ SPA routing veikia (visi routes nukreipiami į `index.html`)
- ✅ Asset caching optimizuotas
- ✅ Vercel automatiškai aptinka Vite projektą

## Paleidimas

### Development Serveris

**SVARBU:** Po Cursor perstartavimo reikia rankiniu būdu paleisti development serverį, kad Browser panelė veiktų.

```bash
npm run dev
```

Arba naudokite `START_SERVER.bat` failą - dukart spustelėkite jį, kad automatiškai paleistų serverį.

### Kodėl Browser nerodo po perstartavimo?

Cursor Browser panelė reikalauja, kad development serveris būtų veikiantis. Po Cursor perstartavimo:
1. Serveris **nėra automatiškai** paleidžiamas
2. Reikia rankiniu būdu paleisti `npm run dev` arba `START_SERVER.bat`
3. Serveris turėtų paleisti portą `http://127.0.0.1:5173`
4. Tada Browser panelė automatiškai rodys turinį

### Kiti komandos

```bash
# Build production
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

---

## Techniniai detaliai

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
