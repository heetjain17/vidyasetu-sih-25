export default {
  network: {
    noConnection: "इंटरनेट कनेक्शन नहीं है",
    timeout: "अनुरोध समय समाप्त हो गया",
    serverError: "सर्वर त्रुटि। कृपया बाद में पुनः प्रयास करें",
  },
  validation: {
    required: "यह फ़ील्ड आवश्यक है",
    invalidEmail: "अमान्य ईमेल पता",
    passwordTooShort: "पासवर्ड कम से कम {{min}} वर्णों का होना चाहिए",
    passwordMismatch: "पासवर्ड मेल नहीं खाते",
    invalidPhone: "अमान्य फ़ोन नंबर",
    invalidDate: "अमान्य तिथि",
  },
  auth: {
    invalidCredentials: "अमान्य ईमेल या पासवर्ड",
    userNotFound: "उपयोगकर्ता नहीं मिला",
    emailInUse: "ईमेल पहले से उपयोग में है",
    weakPassword: "पासवर्ड बहुत कमज़ोर है",
    sessionExpired: "सत्र समाप्त हो गया। कृपया फिर से साइन इन करें",
  },
  generic: {
    somethingWrong: "कुछ गलत हो गया",
    tryAgain: "कृपया पुनः प्रयास करें",
    contactSupport: "यदि समस्या बनी रहती है, तो सहायता से संपर्क करें",
  },
} as const;
