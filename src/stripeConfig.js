// Stripe Configuration
// Set your Stripe publishable key here or use environment variable
// Get your keys from: https://dashboard.stripe.com/apikeys

export const stripeConfig = {
  // Use environment variable if available, otherwise set directly (for development only)
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_publishable_key_here',
  
  // Product IDs - Create these in Stripe Dashboard first
  // Go to: https://dashboard.stripe.com/products
  // Create products with prices:
  // - 100 messages pack: 1 EUR
  // - 1000 messages pack: 7 EUR
  products: {
    pack100: {
      priceId: 'price_your_100_messages_price_id_here', // Replace with actual Price ID from Stripe
      credits: 100,
      amount: 100, // in cents (1 EUR = 100 cents)
    },
    pack1000: {
      priceId: 'price_your_1000_messages_price_id_here', // Replace with actual Price ID from Stripe
      credits: 1000,
      amount: 700, // in cents (7 EUR = 700 cents)
    },
  },
};

// Helper function to create Checkout Session
// This should call your backend API endpoint
// Example: POST /api/create-checkout-session
export const createCheckoutSession = async (priceId, credits) => {
  try {
    // TODO: Replace with your actual backend endpoint
    // For now, this is a mock implementation
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        credits,
        successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/?canceled=true`,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    const { sessionId } = await response.json();
    return sessionId;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    // Fallback: For development, you can use Stripe Payment Links
    // Create Payment Links in Stripe Dashboard and use them directly
    throw error;
  }
};

// Alternative: Direct Payment Link URLs (no backend required)
// Create these in Stripe Dashboard: https://dashboard.stripe.com/payment-links
export const paymentLinks = {
  pack100: 'https://buy.stripe.com/your_100_messages_link', // Replace with actual Payment Link
  pack1000: 'https://buy.stripe.com/your_1000_messages_link', // Replace with actual Payment Link
};
