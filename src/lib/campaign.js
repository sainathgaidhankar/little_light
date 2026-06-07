export const campaignDefaults = {
  title: import.meta.env.VITE_CAMPAIGN_TITLE || '',
  beneficiaryName: import.meta.env.VITE_CAMPAIGN_BENEFICIARY_NAME || '',
  targetAmount: Number(import.meta.env.VITE_CAMPAIGN_TARGET_AMOUNT || 0),
  currency: import.meta.env.VITE_CAMPAIGN_CURRENCY || 'INR',
  campaignEndDate: import.meta.env.VITE_CAMPAIGN_END_DATE || '',
  story:
    import.meta.env.VITE_CAMPAIGN_STORY ||
    `My name is Shehbaaz Imam Sahab, and I am reaching out to seek support for our newborn baby, who is fighting for his life in the NICU at Medicover Woman and Child Hospital, Hyderabad.

Our baby was born prematurely at just 6 months of pregnancy, weighing only 490 grams. Due to his extremely early birth, he is facing several serious health complications. Along with this, one of his ears is also not fully developed. Since birth, he has been under constant medical care, surrounded by machines, medicines, and doctors trying their best to save his tiny life.

This has been the most painful and difficult time for our family. Every single day is a challenge as we watch our little baby struggle to survive. Doctors have advised prolonged NICU treatment, special care, medicines, and procedures to help him recover and grow stronger.

So far, we have already spent around Rs.1,10,000 on his treatment. However, the estimated cost for his continued treatment and NICU care is nearly Rs.20,00,000, which is far beyond our financial capacity.

We humbly request your kind support and prayers for our baby. Even a small contribution can make a big difference in saving his life and giving him a chance to grow up healthy and happy.

Please help us in this difficult journey and share our fundraiser with your family and friends.

Thank you from the bottom of our hearts.

___________________________________________________________________________

मेरा नाम शेहबाज़ इमाम साहब है, और मैं अपने नवजात बच्चे के लिए आपकी मदद और सहयोग की विनम्र अपील कर रहा हूँ। हमारा बच्चा हैदराबाद के मेडिकवर वुमन एंड चाइल्ड हॉस्पिटल के NICU में जिंदगी और मौत की जंग लड़ रहा है।

हमारा बच्चा गर्भावस्था के केवल 6 महीने में ही समय से पहले पैदा हो गया था और उसका जन्म के समय वजन मात्र 490 ग्राम था। समय से पहले जन्म होने के कारण उसे कई गंभीर स्वास्थ्य समस्याओं का सामना करना पड़ रहा है। इसके साथ ही उसका एक कान भी पूरी तरह विकसित नहीं हो पाया है। जन्म के बाद से ही वह लगातार डॉक्टरों की निगरानी, मशीनों और दवाइयों के सहारे NICU में भर्ती है, जहाँ डॉक्टर उसकी जिंदगी बचाने की पूरी कोशिश कर रहे हैं।

यह समय हमारे परिवार के लिए बेहद कठिन और दर्दभरा है। हर दिन अपने मासूम बच्चे को जिंदगी के लिए संघर्ष करते देखना हमारे लिए बहुत मुश्किल है। डॉक्टरों ने लंबे समय तक NICU में इलाज, विशेष देखभाल, दवाइयों और कई जरूरी उपचारों की सलाह दी है ताकि वह स्वस्थ होकर मजबूत बन सके।

अब तक हम इलाज के लिए लगभग ₹1,10,000 खर्च कर चुके हैं। लेकिन आगे के इलाज और NICU देखभाल के लिए लगभग ₹20,00,000 की आवश्यकता है, जो हमारी आर्थिक क्षमता से कहीं अधिक है।

हम आप सभी से हाथ जोड़कर निवेदन करते हैं कि कृपया हमारे बच्चे की मदद करें और अपनी दुआओं में उसे याद रखें। आपका छोटा सा सहयोग भी हमारे बच्चे की जिंदगी बचाने में बहुत बड़ी मदद साबित हो सकता है।

कृपया हमारे इस कठिन समय में हमारा साथ दें और इस अभियान को अपने परिवार और दोस्तों के साथ साझा करें।

दिल से आपका धन्यवाद।

The goal amount of the campaign may be higher than the attached estimates to address and aid the post-hospitalization expenses/contingencies including but not limited to prolonged medication, diagnostics, rehabilitation therapies, and follow-up doctor visits/consultations which vary from disease to disease.`,
  hospitalName: import.meta.env.VITE_HOSPITAL_NAME || '',
  doctorName: import.meta.env.VITE_DOCTOR_NAME || '',
  hospitalAddress: import.meta.env.VITE_HOSPITAL_ADDRESS || '',
  hospitalMapUrl:
    import.meta.env.VITE_HOSPITAL_MAP_URL ||
    'https://maps.app.goo.gl/a5fSWeRyebtsck4j6?g_st=aw',
  patientContactNumber: import.meta.env.VITE_PATIENT_CONTACT_NUMBER || '+91 70454 93868',
  bankAccountName: import.meta.env.VITE_BANK_ACCOUNT_NAME || 'SHEHBAAZ SHAIKH',
  bankAccountHolderName:
    import.meta.env.VITE_BANK_ACCOUNT_HOLDER_NAME ||
    import.meta.env.VITE_BANK_ACCOUNT_NAME ||
    'SHEHBAAZ SHAIKH',
  bankAccountNumber: import.meta.env.VITE_BANK_ACCOUNT_NUMBER || '20147810747',
  bankIfsc: import.meta.env.VITE_BANK_IFSC || 'SBIN0001861',
  bankName: import.meta.env.VITE_BANK_NAME || 'STATE BANK OF INDIA',
  bankUpiId: import.meta.env.VITE_BANK_UPI_ID || '',
};

export const formatCurrency = (value, currency = campaignDefaults.currency) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export const percentRaised = (raised, target = campaignDefaults.targetAmount) =>
  Math.min(100, Math.round((Number(raised || 0) / Number(target || 1)) * 100));

export const daysRemaining = (endDate, fallbackDays = 30) => {
  if (!endDate) return fallbackDays;

  const end = new Date(endDate);
  if (Number.isNaN(end.getTime())) return fallbackDays;

  const diff = end.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

export const emptyUpdates = [];
export const emptyDocuments = [];
