# Stripe Integracijos Konfigūracija

Šis projektas naudoja Stripe mokėjimų sistemą žinučių pirkimui.

## 1. Stripe Paskyros Sukūrimas

1. Eikite į [Stripe Dashboard](https://dashboard.stripe.com/register)
2. Sukurkite nemokamą paskyrą (arba prisijunkite)
3. Patvirtinkite savo el. paštą ir užpildykite paskyros informaciją

## 2. Stripe API Keys Gavyba

1. Eikite į [API Keys puslapį](https://dashboard.stripe.com/apikeys)
2. Test režimui:
   - Raskite **Publishable key** (prasideda su `pk_test_`)
   - Raskite **Secret key** (prasideda su `sk_test_`)
3. Production režimui (kai būsite pasirengę):
   - Perjunkite į **Live mode**
   - Naudokite Live keys (`pk_live_` ir `sk_live_`)

## 3. Konfigūracija Projekte

### Metodas 1: Naudojant Environment Variables (Rekomenduojama)

1. Sukurkite `.env` failą projekto šaknyje:
```bash
# .env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_jūsų_publishable_key
VITE_STRIPE_SECRET_KEY=sk_test_jūsų_secret_key
```

2. **SVARBU**: `.env` failas turi būti `.gitignore` sąraše (jis jau yra ignoruojamas)

### Metodas 2: Tiesioginis Redagavimas

Redaguokite `src/stripeConfig.js` failą ir nustatykite `publishableKey` tiesiogiai:

```javascript
export const stripeConfig = {
  publishableKey: 'pk_test_jūsų_publishable_key_čia',
  // ...
};
```

## 4. Stripe Produktų Sukūrimas

Turite sukurti produktus Stripe Dashboard, kad sistema veiktų.

### Opcija A: Naudoti Payment Links (Paprasčiausia - Nereikia Backend)

1. Eikite į [Payment Links](https://dashboard.stripe.com/payment-links)
2. Sukurkite naują Payment Link:
   - **100 žinučių paketas**: Kaina 1.00 EUR
   - **1000 žinučių paketas**: Kaina 7.00 EUR
3. Nukopijuokite Payment Link URL ir įdėkite į `src/stripeConfig.js`:
   ```javascript
   export const paymentLinks = {
     pack100: 'https://buy.stripe.com/jūsų_100_messages_link',
     pack1000: 'https://buy.stripe.com/jūsų_1000_messages_link',
   };
   ```

### Opcija B: Naudoti Checkout Sessions (Reikia Backend)

1. Eikite į [Products](https://dashboard.stripe.com/products)
2. Sukurkite produktus:
   - **100 žinučių**: Kaina 1.00 EUR
   - **1000 žinučių**: Kaina 7.00 EUR
3. Nukopijuokite **Price ID** (prasideda su `price_`)
4. Įdėkite į `src/stripeConfig.js`:
   ```javascript
   products: {
     pack100: {
       priceId: 'price_xxxxx', // Jūsų Price ID
       credits: 100,
       amount: 100, // centais (1 EUR = 100 centų)
     },
     pack1000: {
       priceId: 'price_yyyyy', // Jūsų Price ID
       credits: 1000,
       amount: 700, // centais (7 EUR = 700 centų)
     },
   },
   ```

## 5. Backend Endpoint Sukūrimas (Jei naudojate Checkout Sessions)

Jei naudojate Stripe Checkout Sessions (ne Payment Links), jums reikia sukurti backend endpoint.

### Backend Endpoint Pavyzdys (Node.js/Express)

```javascript
// POST /api/create-checkout-session
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.post('/api/create-checkout-session', async (req, res) => {
  const { priceId, credits, successUrl, cancelUrl } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        credits: credits.toString(),
        userId: req.user.id, // Jei naudojate autentifikaciją
      },
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook endpoint (privalomas mokėjimo patvirtinimui)
app.post('/api/webhook', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const credits = parseInt(session.metadata.credits);
    const userId = session.metadata.userId;
    
    // Čia pridėkite credits vartotojui į duomenų bazę
    // addCreditsToUser(userId, credits);
  }

  res.json({received: true});
});
```

### Webhook Konfigūracija

1. Eikite į [Webhooks](https://dashboard.stripe.com/webhooks)
2. Pridėkite webhook endpoint: `https://jūsų-domenas.com/api/webhook`
3. Pasirinkite eventus: `checkout.session.completed`
4. Nukopijuokite **Webhook signing secret** ir įdėkite į `.env` kaip `STRIPE_WEBHOOK_SECRET`

## 6. Test Mokėjimų Kortelės

Stripe teikia test korteles mokėjimų testavimui:

- **Sėkmingas mokėjimas**: `4242 4242 4242 4242`
- **Mokėjimas atmestas**: `4000 0000 0000 0002`
- **3D Secure autentifikacija**: `4000 0025 0000 3155`

Bet kokį galiojantį ateities datą ir bet kokį CVC kodą.

## 7. Mokėjimų Sėkmės Puslapio Apdorojimas

Projektas automatiškai apdoroja sėkmingus mokėjimus. Kai vartotojas grįžta iš Stripe Checkout, sistema:

1. Patikrina session ID iš URL
2. Kreipiasi į backend endpoint patvirtinti mokėjimą
3. Prideda credits vartotojui

## 8. Troubleshooting

### Problema: "Stripe publishable key not configured"
**Sprendimas**: Įsitikinkite, kad nustatėte `VITE_STRIPE_PUBLISHABLE_KEY` `.env` faile arba `stripeConfig.js`

### Problema: "Failed to create checkout session"
**Sprendimas**: 
- Patikrinkite, ar sukūrėte backend endpoint `/api/create-checkout-session`
- Patikrinkite, ar nustatėte `STRIPE_SECRET_KEY` serveryje
- Patikrinkite, ar Price ID yra teisingas

### Problema: Mokėjimas sėkmingas, bet credits nepridėti
**Sprendimas**:
- Patikrinkite webhook endpoint
- Patikrinkite, ar webhook event `checkout.session.completed` yra konfigūruotas
- Patikrinkite serverio logs dėl webhook klaidų

## 9. Production Režimas

Kai būsite pasirengę paleisti production:

1. Perjunkite Stripe Dashboard į **Live mode**
2. Pakeiskite API keys į Live keys (`pk_live_` ir `sk_live_`)
3. Sukurkite produktus ir prices Live režime
4. Sukonfigūruokite webhook production URL
5. Testuokite su tikromis kortelėmis su mažomis sumomis

## Papildoma Informacija

- [Stripe Dokumentacija](https://stripe.com/docs)
- [Stripe React Integracija](https://stripe.com/docs/stripe-js/react)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Stripe Payment Links](https://stripe.com/docs/payments/payment-links)
