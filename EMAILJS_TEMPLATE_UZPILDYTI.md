# EmailJS šablonas – patvirtinimo kodas (67x.chat)

Aplikacija siunčia šiuos kintamuosius: **to_email**, **to_name**, **verification_code**.  
EmailJS šablone naudokite **{{kintamojo_pavadinimas}}**.

---

## 1. Sukurkite naują šabloną (arba redaguokite esamą)

EmailJS → **Email Templates** → **Create New Template** (arba atidarykite "Contact Us" ir pervadinkite).

**Template pavadinimas:** pvz. `Verification Code` arba `Patvirtinimo kodas`.

---

## 2. Užpildykite laukus

### Content (kairė pusė)

**Subject \***
```
Patvirtinimo kodas - 67x.chat
```
Arba naudoti dinamišką: `{{subject}}` (tada aplikacija siunčia temą).

**Content \*** (spauskite "Edit Content" ir įrašykite):

```
Sveiki, {{to_name}}!

Jūsų patvirtinimo kodas 67x.chat registracijai: {{verification_code}}

Šis kodas galioja 10 minučių.

Jei jūs neprašėte šio kodo, ignoruokite šį laišką.

Pagarbiai,
67x.chat komanda
```

---

### Dešinė pusė (Settings)

| Laukas      | Įrašykite        | Pastaba |
|-------------|------------------|--------|
| **To Email \*** | `{{to_email}}`   | Būtina – taip laiškas nukreipiamas registruojančiam naudotojui. |
| **From Name**   | `67x.chat` arba `Six Seven` | Siuntėjo vardas. |
| **From Email \*** | Palikite "Use Default Email Address" arba įrašykite savo (pvz. Gmail). | |
| **Reply To**    | Palikite tuščią arba `{{from_email}}` jei naudojate. | |
| **Bcc / Cc**    | Palikite tuščią. | |

---

## 3. Išsaugokite

Spauskite **Save**.  
Nukopijuokite **Template ID** (pvz. `template_xxxxx`).

---

## 4. Raktai aplikacijai

Jums reikės trijų ID iš EmailJS:

- **Service ID** (Email Services → jūsų service)
- **Template ID** (Email Templates → šis šablonas)
- **Public Key** (Account → Public Key)

Šiuos įrašysime į `.env` arba `emailService.js`, kad el. laiškai siųstųsi tikrai.
