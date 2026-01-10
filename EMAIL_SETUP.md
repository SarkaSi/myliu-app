# Email Siuntimo Konfigūracija

Šis projektas naudoja email siuntimo sistemą patvirtinimo kodų siuntimui registracijos metu.

## Problemos Sprendimas

Jei registracijos metu nebuvo išsiųstas laiškas nurodytu email, reikia sukonfigūruoti email siuntimo sistemą.

## Konfigūracijos Metodai

### Metodas 1: EmailJS (Rekomenduojama - Nereikia Backend)

EmailJS leidžia siųsti email'us tiesiogiai iš frontend be backend serverio.

#### 1. Sukurkite EmailJS paskyrą

1. Eikite į [EmailJS](https://www.emailjs.com/)
2. Sukurkite nemokamą paskyrą
3. Patvirtinkite email

#### 2. Sukonfigūruokite Email Service su nsaru378@gmail.com

1. Eikite į [Email Services](https://dashboard.emailjs.com/admin/integration)
2. Pridėkite **Gmail Service** arba **Custom SMTP Service**
3. Konfigūruokite su `nsaru378@gmail.com`:

**Gmail Service:**
- Prisijunkite su `nsaru378@gmail.com` paskyra
- Patvirtinkite prieigą
- Service ID bus automatiškai sukurtas

**Custom SMTP (jei Gmail Service neveikia):**
- Service Type: SMTP
- SMTP Server: `smtp.gmail.com`
- SMTP Port: `587` (TLS) arba `465` (SSL)
- SMTP Username: `nsaru378@gmail.com`
- SMTP Password: [Gmail App Password - žr. žemiau]

**Gmail App Password sukūrimas:**
1. Eikite į [Google Account Security](https://myaccount.google.com/security)
2. Įjunkite 2-Step Verification (jei dar neįjungta)
3. Eikite į [App Passwords](https://myaccount.google.com/apppasswords)
4. Sukurkite naują App Password aplikacijai "EmailJS"
5. Nukopijuokite 16 simbolių slaptažodį ir naudokite SMTP Password lauke

#### 3. Sukonfigūruokite Email Service su Gmail

1. Eikite į [Email Services](https://dashboard.emailjs.com/admin/integration)
2. Pridėkite Gmail Service arba Custom SMTP Service
3. Konfigūruokite su `nsaru378@gmail.com`:
   - **Gmail Service**: Prisijunkite su `nsaru378@gmail.com` paskyra
   - **Custom SMTP**: Naudokite Gmail SMTP nustatymus:
     - Host: `smtp.gmail.com`
     - Port: `587`
     - User: `nsaru378@gmail.com`
     - Password: [Gmail App Password - sukurkite Google Account Security]

#### 4. Sukurkite Email Template

1. Eikite į [Email Templates](https://dashboard.emailjs.com/admin/template)
2. Sukurkite naują template'ą su šiuo turiniu:

**Template Subject:**
```
Patvirtinimo kodas - Six ❤ Seven
```

**Template Content (HTML):**
```html
Sveiki {{to_name}}!

Jūsų patvirtinimo kodas registracijai: {{verification_code}}

Įveskite šį kodą registracijos formoje, kad užbaigtumėte registraciją.

Jei jūs nebandėte registruotis Six ❤ Seven platformoje, prašome ignoruoti šį laišką.

Pagarbiai,
Six ❤ Seven komanda
```

**Template Variables (reikalingi):**
- `{{to_name}}` - gavėjo vardas
- `{{verification_code}}` - patvirtinimo kodas
- `{{from_email}}` - siuntimo email (nsaru378@gmail.com)
- `{{reply_to}}` - atsakymo email (nsaru378@gmail.com)

3. Nukopijuokite Template ID

#### 4. Gauti Public Key

1. Eikite į [Account](https://dashboard.emailjs.com/admin)
2. Nukopijuokite Public Key

#### 5. Konfigūruoti Projektą

Redaguokite `src/emailService.js` failą:

```javascript
export const emailJSConfig = {
  serviceId: 'your_service_id', // Jūsų EmailJS Service ID
  templateId: 'your_template_id', // Jūsų EmailJS Template ID
  publicKey: 'your_public_key', // Jūsų EmailJS Public Key
  enabled: true // Įjungti email siuntimą
};
```

Arba naudokite environment variables (rekomenduojama):

Sukurkite `.env` failą projektų šaknyje:

```bash
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
VITE_EMAILJS_ENABLED=true
```

**SVARBU:** Po `.env` failo sukūrimo arba pakeitimų, **reikia perkrauti Vite dev serverį** (`npm run dev` arba `START_SERVER.bat`).

`src/emailService.js` jau konfigūruotas automatiškai skaityti iš `.env` failo. Tiesiog sukurkite `.env` failą su jūsų EmailJS duomenimis.

**Email siunčiamas iš:** `nsaru378@gmail.com` (nustatyta automatiškai `emailService.js` faile)

**Template parametrai, kurie naudojami:**
- `to_email` - gavėjo email adresas
- `to_name` - gavėjo vardas (arba email dalis prieš @)
- `verification_code` - 6 skaitmenų patvirtinimo kodas
- `from_email` - siuntimo email (`nsaru378@gmail.com`)
- `reply_to` - atsakymo email (`nsaru378@gmail.com`)

### Metodas 2: Backend API Endpoint (Production)

Jei turite backend serverį, sukurkite email siuntimo endpoint'ą.

#### Backend Endpoint Pavyzdys (Node.js/Express)

```javascript
// POST /api/send-verification-email
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

app.post('/api/send-verification-email', async (req, res) => {
  const { to, name, code, type } = req.body;

  try {
    const mailOptions = {
      from: '"Six ❤ Seven" <noreply@sixseven.com>',
      to: to,
      subject: 'Patvirtinimo kodas - Six ❤ Seven',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f97316;">Sveiki ${name}!</h2>
          <p>Jūsų patvirtinimo kodas: <strong style="font-size: 24px; color: #f97316;">${code}</strong></p>
          <p>Įveskite šį kodą registracijos formoje, kad užbaigtumėte registraciją.</p>
          <p>Jei jūs nebandėte registruotis, prašome ignoruoti šį laišką.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #9ca3af; font-size: 12px;">Pagarbiai,<br>Six ❤ Seven komanda</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Email sėkmingai išsiųstas' });
  } catch (error) {
    console.error('Email siuntimo klaida:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});
```

#### Konfigūruoti Projektą

Redaguokite `src/emailService.js`:

```javascript
export const backendConfig = {
  apiUrl: '/api/send-verification-email', // Jūsų backend endpoint
  enabled: true // Įjungti backend email siuntimą
};
```

### Metodas 3: Mock/Development Režimas

Development režime sistema automatiškai naudoja mock funkciją, kuri:
- Rodo kodą console
- Development režime rodo kodą alert
- Production režime nerodo kodo (tik email/SMS)

## Troubleshooting

### Problema: Email nebuvo išsiųstas
**Sprendimas**: 
- Patikrinkite, ar EmailJS konfigūracija tinkama `src/emailService.js`
- Patikrinkite, ar `enabled: true` nustatytas
- Patikrinkite browser console dėl klaidų
- Development režime patikrinkite console, ar kodas generuojamas

### Problema: "EmailJS nekonfigūruotas"
**Sprendimas**: 
- Patikrinkite, ar nustatėte visus EmailJS parametrus (serviceId, templateId, publicKey)
- Patikrinkite, ar `emailJSConfig.enabled = true`
- Patikrinkite, ar `.env` failas yra teisingai konfigūruotas

### Problema: Email siuntimas nepavyko
**Sprendimas**:
- Patikrinkite EmailJS dashboard dėl klaidų
- Patikrinkite email serviso nustatymus EmailJS
- Patikrinkite, ar email template teisingai konfigūruotas
- Patikrinkite, ar template kintamieji atitinka ({{to_name}}, {{verification_code}})

### Problema: Email atėjo, bet kodas neveikia
**Sprendimas**:
- Patikrinkite, ar kodas tikrai teisingas (turi būti 6 skaitmenys)
- Patikrinkite browser console, ar `storedVerificationCode` yra nustatytas
- Patikrinkite, ar kodas nėra išvalytas prieš patvirtinimą

## Email Template Pavyzdys (EmailJS)

**Subject:**
```
Patvirtinimo kodas - Six ❤ Seven
```

**Body (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .code { font-size: 32px; font-weight: bold; color: #f97316; text-align: center; padding: 20px; background: white; border-radius: 8px; margin: 20px 0; letter-spacing: 5px; }
    .footer { text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Six ❤ Seven</h1>
    </div>
    <div class="content">
      <p>Sveiki {{to_name}}!</p>
      <p>Jūsų patvirtinimo kodas registracijai:</p>
      <div class="code">{{verification_code}}</div>
      <p>Įveskite šį kodą registracijos formoje, kad užbaigtumėte registraciją.</p>
      <p><strong>Kodas galioja 10 minučių.</strong></p>
      <p>Jei jūs nebandėte registruotis Six ❤ Seven platformoje, prašome ignoruoti šį laišką.</p>
      <div class="footer">
        <p>Pagarbiai,<br>Six ❤ Seven komanda</p>
        <p>Siunčiama iš: nsaru378@gmail.com</p>
      </div>
    </div>
  </div>
</body>
</html>
```

**SVARBU:** Email siunčiamas iš `nsaru378@gmail.com`. Įsitikinkite, kad:
1. Gmail Service nustatytas su `nsaru378@gmail.com` paskyra
2. Naudojate Gmail App Password (ne įprastą slaptažodį)
3. Template naudoja `{{from_email}}` ir `{{reply_to}}` parametrus

## SMS Siuntimas (Ateityje)

SMS siuntimas dabar yra simuliacijoje. Produkcijai reikia integruoti SMS API, pvz.:
- Twilio
- Nexmo/Vonage
- SMS Gateway API
- Arba backend endpoint'ą SMS siuntimui

## Papildoma Informacija

- [EmailJS Dokumentacija](https://www.emailjs.com/docs/)
- [EmailJS Templates](https://www.emailjs.com/docs/examples/reactjs/)
- [Nodemailer Dokumentacija](https://nodemailer.com/)
