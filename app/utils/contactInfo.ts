// app/utils/contactInfo.ts
export const contactInfo = {
  whatsapp: "8801887864760",
  phone: "+880 1887-864760",
  email: "support@wetraineducation.com",
};

export function useContactInfo() {
  const contactPhone = "+880 1887-864760";
  const supportEmail = "support@wetraineducation.com";

  return { contactPhone, supportEmail };
}
