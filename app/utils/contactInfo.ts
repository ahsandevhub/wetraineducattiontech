// app/utils/contactInfo.ts
import { useEffect, useState } from "react";

export function useContactInfo() {
  const [contactPhone, setContactPhone] = useState("+13073103421");
  const supportEmail = "support@wetraineducation.com";

  useEffect(() => {
    if (typeof window !== "undefined") {
      const { hostname, origin } = window.location;
      const isWeTrain =
        origin === "https://www.wetraineducation.com" ||
        origin === "https://www.wetraineducation.com/" ||
        hostname === "www.wetraineducation.com";
      setContactPhone(isWeTrain ? "+880 1887-864760" : "+13073103421");
    }
  }, []);

  return { contactPhone, supportEmail };
}
