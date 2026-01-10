# Email Siuntimo Konfigūracija - Išsami Instrukcija

Šis projektas naudoja EmailJS servisą patvirtinimo kodų siuntimui registracijos metu. Email siunčiamas iš `myliu67x@outlook.com`.

---

## 📋 Žingsnis po žingsnio instrukcija

### 1 ŽINGSNIS: Sukurkite EmailJS paskyrą

1. **Atidarykite naršyklę ir eikite į:** [https://www.emailjs.com/](https://www.emailjs.com/)
2. **Spustelėkite** "Sign Up" (Registracija) mygtuką
3. **Užpildykite registracijos formą:**
   - Email: Įveskite bet kokį email (gali būti kitas nei `myliu67x@outlook.com`)
   - Password: Sukurkite slaptažodį
   - Confirm Password: Pakartokite slaptažodį
4. **Patvirtinkite email** - patikrinkite el. paštą ir spustelėkite patvirtinimo nuorodą
5. **Prisijunkite** į EmailJS dashboard: [https://dashboard.emailjs.com/](https://dashboard.emailjs.com/)

✅ **Rezultatas:** Turite EmailJS paskyrą ir esate prisijungę

---

### 2 ŽINGSNIS: Pridėkite Email Service (Outlook.com)

1. **Eikite į Email Services:**
   - Spustelėkite "Email Services" meniu kairėje
   - Arba eikite tiesiogiai: [https://dashboard.emailjs.com/admin/integration](https://dashboard.emailjs.com/admin/integration)

2. **Pridėkite naują servisą:**
   - Spustelėkite "+ Add New Service" mygtuką
   - Pasirinkite "Custom SMTP" (OUTLOOK.COM NENAUDOJA Gmail Service)

3. **Užpildykite SMTP nustatymus:**
   
   **Service Name:** `Outlook SMTP` (arba bet koks kitas pavadinimas)
   
   **SMTP Configuration:**
   - **Service Type:** SMTP
   - **SMTP Server:** `smtp-mail.outlook.com`
   - **SMTP Port:** `587`
   - **Secure Connection:** STARTTLS (TLS)
   - **SMTP Username:** `myliu67x@outlook.com`
   - **SMTP Password:** [žr. žemiau - kaip sukurti Outlook App Password]
   
4. **Spustelėkite "Create Service"**

✅ **Rezultatas:** Turite sukonfigūruotą Outlook SMTP servisą. **Nukopijuokite Service ID** (jis bus reikalingas vėliau).

---

### 3 ŽINGSNIS: Sukurkite Outlook App Password

Outlook.com reikalauja App Password, kad trečiųjų šalių aplikacijos galėtų siųsti email'us.

#### 3.1. Įjunkite Two-Factor Authentication (2FA)

1. **Eikite į Microsoft Account Security:**
   - Atidarykite: [https://account.microsoft.com/security](https://account.microsoft.com/security)
   - Prisijunkite su `myliu67x@outlook.com` paskyra

2. **Eikite į Security Settings:**
   - Spustelėkite "Advanced security options"
   - Arba eikite tiesiogiai: [https://account.microsoft.com/security/advanced-security-options](https://account.microsoft.com/security/advanced-security-options)

3. **Įjunkite Two-step verification:**
   - Raskite "Two-step verification" sekciją
   - Spustelėkite "Turn on" arba "Set up two-step verification"
   - Sekite instrukcijas:
     - Pasirinkite telefono numerį arba email adresą patvirtinimui
     - Gautumėte patvirtinimo kodą
     - Įveskite kodą ir patvirtinkite

✅ **Rezultatas:** Two-step verification įjungtas

#### 3.2. Sukurkite App Password

1. **Eikite į App Passwords:**
   - Atgal į Advanced security options puslapį
   - Spustelėkite "App passwords" (jei nematote, patikrinkite, ar 2FA įjungtas)
   - Arba eikite tiesiogiai: [https://account.microsoft.com/security/app-passwords](https://account.microsoft.com/security/app-passwords)

2. **Sukurkite naują App Password:**
   - Spustelėkite "Create a new app password"
   - **App name:** `EmailJS` (arba bet koks kitas pavadinimas)
   - **Spustelėkite "Generate"**

3. **Nukopijuokite App Password:**
   - Jums bus parodomas 16 simbolių slaptažodis (pvz.: `abcd efgh ijkl mnop`)
   - **SVARBU:** Nukopijuokite jį dabar - jo daugiau nematysite!
   - **Nepridėkite tarpų** - naudokite kaip vieną eilutę: `abcdefghijklmnop`
   - Šį slaptažodį naudokite EmailJS SMTP Password lauke

✅ **Rezultatas:** Turite Outlook App Password, kurį naudosite EmailJS konfigūracijoje

---

### 4 ŽINGSNIS: Sukonfigūruokite EmailJS su Outlook SMTP

1. **Grįžkite į EmailJS Dashboard:**
   - Eikite į: [https://dashboard.emailjs.com/admin/integration](https://dashboard.emailjs.com/admin/integration)

2. **Redaguokite sukurtą servisą:**
   - Spustelėkite ant sukurtos "Outlook SMTP" paslaugos
   - Arba spustelėkite "Edit" prie serviso

3. **Patikrinkite arba atnaujinkite nustatymus:**
   
   **SMTP Server:** `smtp-mail.outlook.com`
   
   **SMTP Port:** `587`
   
   **Secure Connection:** STARTTLS (TLS) arba SSL/TLS
   
   **SMTP Username:** `myliu67x@outlook.com`
   
   **SMTP Password:** [Įdėkite nukopijuotą App Password be tarpų]
   
4. **Testuokite servisą:**
   - Spustelėkite "Send Test Email" (jei yra tokia funkcija)
   - Arba išsaugokite ir testuokite per template (žr. kitą žingsnį)

5. **Išsaugokite pakeitimus**

✅ **Rezultatas:** Outlook SMTP servisas sukonfigūruotas ir veikia

---

### 5 ŽINGSNIS: Sukurkite Email Template

1. **Eikite į Email Templates:**
   - Spustelėkite "Email Templates" meniu kairėje
   - Arba eikite tiesiogiai: [https://dashboard.emailjs.com/admin/template](https://dashboard.emailjs.com/admin/template)

2. **Pridėkite naują template:**
   - Spustelėkite "+ Create New Template"
   - Pasirinkite sukurtą servisą (jūsų Outlook SMTP servisas)

3. **Template Name:** `Verification Code - Six Seven`

4. **Template ID:** Automatiškai sugeneruojamas (arba galite pasirinkti savo) - **Nukopijuokite šį ID!**

5. **Template Content:**

   **Subject (Tema):**
   ```
   Patvirtinimo kodas - Six ❤ Seven
   ```

   **Content (Turinys) - HTML:**
   ```html
   <!DOCTYPE html>
   <html>
   <head>
     <meta charset="UTF-8">
     <style>
       body { 
         font-family: Arial, sans-serif; 
         line-height: 1.6; 
         color: #333; 
         margin: 0; 
         padding: 0; 
         background-color: #f5f5f5; 
       }
       .container { 
         max-width: 600px; 
         margin: 20px auto; 
         background: white; 
         border-radius: 10px; 
         overflow: hidden; 
         box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
       }
       .header { 
         background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); 
         color: white; 
         padding: 30px 20px; 
         text-align: center; 
       }
       .header h1 { 
         margin: 0; 
         font-size: 28px; 
       }
       .content { 
         padding: 30px; 
       }
       .code { 
         font-size: 36px; 
         font-weight: bold; 
         color: #f97316; 
         text-align: center; 
         padding: 25px; 
         background: #fff5f0; 
         border: 2px dashed #f97316; 
         border-radius: 8px; 
         margin: 30px 0; 
         letter-spacing: 8px; 
         font-family: 'Courier New', monospace; 
       }
       .footer { 
         text-align: center; 
         color: #9ca3af; 
         font-size: 12px; 
         margin-top: 30px; 
         padding-top: 20px; 
         border-top: 1px solid #e5e7eb; 
       }
       .button { 
         display: inline-block; 
         padding: 12px 24px; 
         background: #f97316; 
         color: white; 
         text-decoration: none; 
         border-radius: 6px; 
         margin: 20px 0; 
       }
     </style>
   </head>
   <body>
     <div class="container">
       <div class="header">
         <h1>Six ❤ Seven</h1>
       </div>
       <div class="content">
         <p>Sveiki <strong>{{to_name}}</strong>!</p>
         <p>Jūsų patvirtinimo kodas registracijai platformoje Six ❤ Seven:</p>
         <div class="code">{{verification_code}}</div>
         <p style="text-align: center;">
           <strong>Įveskite šį kodą registracijos formoje, kad užbaigtumėte registraciją.</strong>
         </p>
         <p><strong>⏰ Kodas galioja 10 minučių.</strong></p>
         <p>Jei jūs nebandėte registruotis Six ❤ Seven platformoje, prašome ignoruoti šį laišką.</p>
         <div class="footer">
           <p>Pagarbiai,<br><strong>Six ❤ Seven komanda</strong></p>
           <p style="margin-top: 10px; color: #6b7280;">Siunčiama iš: myliu67x@outlook.com</p>
         </div>
       </div>
     </div>
   </body>
   </html>
   ```

6. **Template Variables (Kintamieji):**
   
   Užtikrinkite, kad template naudoja šiuos kintamuosius:
   - `{{to_name}}` - gavėjo vardas
   - `{{verification_code}}` - 6 skaitmenų patvirtinimo kodas
   - `{{from_email}}` - siuntimo email (myliu67x@outlook.com) - galima pridėti, bet neprivaloma
   - `{{reply_to}}` - atsakymo email (myliu67x@outlook.com) - galima pridėti, bet neprivaloma

7. **Išsaugokite template**

✅ **Rezultatas:** Turite sukurtą email template su Template ID

---

### 6 ŽINGSNIS: Gauti EmailJS Public Key

1. **Eikite į Account Settings:**
   - Spustelėkite savo vardą/profilį viršuje dešinėje
   - Spustelėkite "Account" arba "Settings"
   - Arba eikite tiesiogiai: [https://dashboard.emailjs.com/admin](https://dashboard.emailjs.com/admin)

2. **Raskite Public Key:**
   - Scroll down iki "API Keys" sekcijos
   - Arba eikite į "API Keys" tab
   - **Nukopijuokite Public Key** (atrodys kaip: `xxxxxxxxxxxxxxxx`)

✅ **Rezultatas:** Turite EmailJS Public Key

---

### 7 ŽINGSNIS: Konfigūruokite Projektą

Dabar turite visus reikalingus duomenis:
- ✅ Service ID (iš 2 žingsnio)
- ✅ Template ID (iš 5 žingsnio)
- ✅ Public Key (iš 6 žingsnio)

#### 7.1. Sukurkite `.env` failą (REKOMENDUOJAMA)

1. **Sukurkite `.env` failą projekto šaknyje:**
   - Atidarykite projektų katalogą: `c:\Users\maini\Desktop\Cursor Myliu\myliu-app\`
   - Sukurkite naują failą su pavadinimu `.env` (su tašku pradžioje!)

2. **Įdėkite šiuos duomenis į `.env` failą:**
   ```bash
   VITE_EMAILJS_SERVICE_ID=your_service_id_here
   VITE_EMAILJS_TEMPLATE_ID=your_template_id_here
   VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
   VITE_EMAILJS_ENABLED=true
   ```

   **Pavyzdys:**
   ```bash
   VITE_EMAILJS_SERVICE_ID=service_abc123
   VITE_EMAILJS_TEMPLATE_ID=template_xyz789
   VITE_EMAILJS_PUBLIC_KEY=abcdefghijklmnop
   VITE_EMAILJS_ENABLED=true
   ```

3. **SVARBU:** Pakeiskite `your_service_id_here`, `your_template_id_here` ir `your_public_key_here` su jūsų tikrais duomenimis!

#### 7.2. Arba redaguokite `src/emailService.js` tiesiogiai

Jei nenorite naudoti `.env` failo, galite redaguoti `src/emailService.js`:

```javascript
export const emailJSConfig = {
  serviceId: 'your_service_id_here', // Jūsų Service ID
  templateId: 'your_template_id_here', // Jūsų Template ID
  publicKey: 'your_public_key_here', // Jūsų Public Key
  fromEmail: 'myliu67x@outlook.com',
  enabled: true // Įjungti email siuntimą
};
```

**SVARBU:** Jei naudojate `.env` failą, **perkraukite Vite dev serverį** (`npm run dev` arba `START_SERVER.bat`).

✅ **Rezultatas:** Projektas sukonfigūruotas su EmailJS

---

### 8 ŽINGSNIS: Testuokite Email Siuntimą

1. **Paleiskite projektą:**
   - Jei naudojate `.env` failą - perkraukite serverį
   - Atidarykite: `http://localhost:5173` (arba kitą portą)

2. **Bandykite registraciją:**
   - Spustelėkite "Registruotis"
   - Įveskite email adresą (į kurį norite gauti test email)
   - Užpildykite kitus laukus
   - Spustelėkite "Registruotis"

3. **Patikrinkite email:**
   - Atidarykite el. pašto dėžutę (į kurią registravotės)
   - Patikrinkite ir "Spam" / "Nepageidaujama pašta" aplanką
   - Turėtumėte gauti email su patvirtinimo kodu

4. **Patikrinkite Browser Console:**
   - Atidarykite Developer Tools (F12)
   - Eikite į "Console" tab
   - Ieškokite žinučių apie email siuntimą:
     - `✅ Email sėkmingai išsiųstas į ... iš myliu67x@outlook.com`
     - Arba klaidų pranešimų

✅ **Rezultatas:** Email siuntimas veikia!

---

## ⚠️ Troubleshooting (Problemų sprendimas)

### Problema: "EmailJS nekonfigūruotas"

**Sprendimas:**
1. Patikrinkite, ar `.env` failas yra projekto šaknyje
2. Patikrinkite, ar visi duomenys teisingi (be tarpų, be kabučių)
3. Patikrinkite, ar perkrovėte serverį po `.env` failo sukūrimo
4. Patikrinkite `src/emailService.js`, ar `enabled: true`

---

### Problema: "Email siuntimo klaida" arba "SMTP authentication failed"

**Sprendimas:**
1. **Patikrinkite Outlook App Password:**
   - Įsitikinkite, kad naudojate App Password, ne įprastą slaptažodį
   - Patikrinkite, ar App Password nukopijuotas be tarpų
   - Jei reikia, sukurkite naują App Password

2. **Patikrinkite SMTP nustatymus:**
   - SMTP Server: `smtp-mail.outlook.com` (tiksliai taip!)
   - SMTP Port: `587` (ne 465, ne 25)
   - Secure Connection: STARTTLS arba TLS
   - Username: `myliu67x@outlook.com` (visas email adresas)

3. **Patikrinkite Two-Factor Authentication:**
   - Įsitikinkite, kad 2FA įjungtas
   - App Passwords veikia tik su įjungtu 2FA

---

### Problema: Email nebuvo išsiųstas

**Sprendimas:**
1. Patikrinkite Browser Console dėl klaidų (F12 → Console)
2. Patikrinkite EmailJS Dashboard → Logs (jei yra)
3. Patikrinkite, ar email neatsidėjo Spam aplanke
4. Patikrinkite, ar template ID teisingas
5. Patikrinkite, ar service ID teisingas
6. Patikrinkite, ar public key teisingas

---

### Problema: Email atėjo, bet kodas neveikia

**Sprendimas:**
1. Patikrinkite, ar kodas tikrai teisingas (6 skaitmenys)
2. Patikrinkite Browser Console, ar `storedVerificationCode` yra nustatytas
3. Patikrinkite, ar kodas nėra išvalytas prieš patvirtinimą
4. Įsitikinkite, kad naudojate tą patį email adresą, kurį registravotės

---

## 📝 Outlook SMTP Nustatymai (Sąmata)

Jei reikia rankiniu būdu konfigūruoti (pvz., kituose servisuose):

```
SMTP Server: smtp-mail.outlook.com
SMTP Port: 587
Encryption: STARTTLS (TLS)
Authentication: Required
Username: myliu67x@outlook.com
Password: [Outlook App Password - 16 simbolių be tarpų]
```

**Alternatyvūs nustatymai (jei 587 neveikia):**
```
SMTP Server: smtp.office365.com
SMTP Port: 587
Encryption: STARTTLS
```

---

## 🔗 Naudingos Nuorodos

- **EmailJS Dashboard:** [https://dashboard.emailjs.com/](https://dashboard.emailjs.com/)
- **EmailJS Services:** [https://dashboard.emailjs.com/admin/integration](https://dashboard.emailjs.com/admin/integration)
- **EmailJS Templates:** [https://dashboard.emailjs.com/admin/template](https://dashboard.emailjs.com/admin/template)
- **EmailJS API Keys:** [https://dashboard.emailjs.com/admin](https://dashboard.emailjs.com/admin)
- **Microsoft Account Security:** [https://account.microsoft.com/security](https://account.microsoft.com/security)
- **Microsoft App Passwords:** [https://account.microsoft.com/security/app-passwords](https://account.microsoft.com/security/app-passwords)

---

## ✅ Patikra: Visi žingsniai atlikti

Patikrinkite, ar turite:

- [ ] EmailJS paskyrą
- [ ] Sukurtą Outlook SMTP servisą su Service ID
- [ ] Outlook App Password
- [ ] Sukurtą email template su Template ID
- [ ] EmailJS Public Key
- [ ] `.env` failą su visais duomenimis (arba redaguotą `emailService.js`)
- [ ] Perkrautą Vite serverį (jei naudojate `.env`)
- [ ] Ištestuotą email siuntimą

---

**Pastaba:** Jei vis dar kyla problemų, patikrinkite EmailJS dokumentaciją arba susisiekite su EmailJS support.
