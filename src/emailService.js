// Email Service Configuration
// Supports EmailJS (frontend) and Backend API endpoints

// EmailJS Configuration (No backend required)
// Get your keys from: https://dashboard.emailjs.com/admin
// You can configure via environment variables or directly here
export const emailJSConfig = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'your_service_id', // Replace with your EmailJS service ID
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'your_template_id', // Replace with your EmailJS template ID
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'your_public_key', // Replace with your EmailJS public key
  fromEmail: 'nsaru378@gmail.com', // Email from which verification emails are sent
  enabled: import.meta.env.VITE_EMAILJS_ENABLED === 'true' || false // Set to true after configuring EmailJS
};

// Backend API Configuration (Requires backend)
export const backendConfig = {
  apiUrl: import.meta.env.VITE_BACKEND_EMAIL_API_URL || '/api/send-verification-email', // Your backend endpoint
  enabled: import.meta.env.VITE_BACKEND_EMAIL_ENABLED === 'true' || false // Set to true when backend is ready
};

/**
 * Send verification email using EmailJS (frontend solution)
 */
export const sendEmailViaEmailJS = async (toEmail, verificationCode, userName) => {
  try {
    // Dynamic import to avoid issues if EmailJS is not configured
    const emailjs = await import('@emailjs/browser');
    
    if (!emailJSConfig.enabled || !emailJSConfig.serviceId || emailJSConfig.serviceId === 'your_service_id') {
      throw new Error('EmailJS nekonfigūruotas. Prašome nustatyti EmailJS konfigūraciją arba naudoti backend.');
    }

    const templateParams = {
      to_email: toEmail,
      to_name: userName,
      verification_code: verificationCode,
      from_name: 'Six ❤ Seven',
      from_email: 'nsaru378@gmail.com',
      reply_to: 'nsaru378@gmail.com',
      subject: 'Patvirtinimo kodas - Six ❤ Seven'
    };

    const response = await emailjs.default.send(
      emailJSConfig.serviceId,
      emailJSConfig.templateId,
      templateParams,
      emailJSConfig.publicKey
    );

    if (response.status === 200) {
      return { success: true, message: 'Email sėkmingai išsiųstas' };
    } else {
      throw new Error('Email siuntimo klaida');
    }
  } catch (error) {
    console.error('EmailJS klaida:', error);
    throw error;
  }
};

/**
 * Send verification email using Backend API
 */
export const sendEmailViaBackend = async (toEmail, verificationCode, userName) => {
  try {
    if (!backendConfig.enabled) {
      throw new Error('Backend email siuntimas neįjungtas');
    }

    const response = await fetch(backendConfig.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: toEmail,
        name: userName,
        code: verificationCode,
        type: 'verification'
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, message: 'Email sėkmingai išsiųstas per backend', data };
  } catch (error) {
    console.error('Backend email klaida:', error);
    throw error;
  }
};

/**
 * Main function to send verification email
 * Tries EmailJS first, then falls back to backend, then to mock
 */
export const sendVerificationEmail = async (toEmail, verificationCode, userName) => {
  // Try EmailJS first if enabled
  if (emailJSConfig.enabled) {
    try {
      return await sendEmailViaEmailJS(toEmail, verificationCode, userName);
    } catch (error) {
      console.warn('EmailJS failed, trying backend...', error);
    }
  }

  // Try Backend API if enabled
  if (backendConfig.enabled) {
    try {
      return await sendEmailViaBackend(toEmail, verificationCode, userName);
    } catch (error) {
      console.warn('Backend failed, using mock...', error);
    }
  }

  // Fallback to mock/development mode
  console.log('Email siuntimas (mock):', {
    to: toEmail,
    code: verificationCode,
    name: userName
  });
  
  // In development, we can show the code in console
  // In production, this should be removed or replaced with proper email service
  return { 
    success: true, 
    message: 'Email siuntimas simuliuojamas (mock mode)', 
    mock: true,
    code: verificationCode // Only in development
  };
};
