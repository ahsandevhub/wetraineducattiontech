import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type PaymentData = {
  id: string;
  amount: number;
  method: string;
  status: string;
  service: string | null;
  reference: string | null;
  created_at: string;
  profiles?: {
    full_name?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    postal_code?: string | null;
    country?: string | null;
  } | null;
};

// Helper function to safely get payment data with defaults
const getSafePaymentData = (payment: PaymentData) => {
  const profiles = payment.profiles || {};
  return {
    ...payment,
    profiles: {
      full_name: profiles.full_name || "Customer",
      email: profiles.email || "N/A",
      phone: profiles.phone || null,
      address: profiles.address || null,
      city: profiles.city || null,
      state: profiles.state || null,
      postal_code: profiles.postal_code || null,
      country: profiles.country || "Bangladesh",
    },
  };
};

export const generateInvoice = (payment: PaymentData) => {
  try {
    const safePayment = getSafePaymentData(payment);
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Company Header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("WeTrain Education", pageWidth / 2, 20, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Professional Training & Development", pageWidth / 2, 27, {
      align: "center",
    });
    doc.text("Email: info@wetraineducation.com", pageWidth / 2, 32, {
      align: "center",
    });

    // Invoice Title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", 14, 50);

    // Invoice Details
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Invoice Number: INV-${safePayment.id.slice(0, 8).toUpperCase()}`,
      14,
      58,
    );
    doc.text(
      `Date: ${new Date(safePayment.created_at).toLocaleDateString()}`,
      14,
      64,
    );
    doc.text(`Status: ${safePayment.status.toUpperCase()}`, 14, 70);

    // Customer Details
    doc.setFont("helvetica", "bold");
    doc.text("Bill To:", 14, 85);
    doc.setFont("helvetica", "normal");
    doc.text(safePayment.profiles.full_name, 14, 91);
    doc.text(safePayment.profiles.email, 14, 97);

    let yPos = 103;
    if (safePayment.profiles.phone) {
      doc.text(`Phone: ${safePayment.profiles.phone}`, 14, yPos);
      yPos += 6;
    }
    if (safePayment.profiles.address) {
      doc.text(safePayment.profiles.address, 14, yPos);
      yPos += 6;
      if (safePayment.profiles.city) {
        const location = [
          safePayment.profiles.city,
          safePayment.profiles.state,
          safePayment.profiles.postal_code,
        ]
          .filter(Boolean)
          .join(", ");
        doc.text(location, 14, yPos);
        yPos += 6;
      }
    }

    // Table
    autoTable(doc, {
      startY: Math.max(yPos + 5, 125),
      head: [["Description", "Amount"]],
      body: [
        [
          safePayment.service || "Service",
          `৳${safePayment.amount.toLocaleString("en-BD", { minimumFractionDigits: 2 })}`,
        ],
      ],
      theme: "grid",
      headStyles: { fillColor: [0, 0, 0] },
      styles: { fontSize: 10 },
    });

    // Total
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const finalY = (doc as any).lastAutoTable.finalY || 145;
    doc.setFont("helvetica", "bold");
    doc.text(
      `Total Amount: ৳${safePayment.amount.toLocaleString("en-BD", { minimumFractionDigits: 2 })}`,
      pageWidth - 14,
      finalY + 10,
      { align: "right" },
    );
    doc.text(
      `Payment Method: ${safePayment.method.toUpperCase()}`,
      pageWidth - 14,
      finalY + 16,
      { align: "right" },
    );
    if (payment.reference) {
      doc.setFont("helvetica", "normal");
      doc.text(`Reference: ${payment.reference}`, pageWidth - 14, finalY + 22, {
        align: "right",
      });
    }

    // Footer
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.text(
      "Thank you for your business!",
      pageWidth / 2,
      doc.internal.pageSize.height - 20,
      { align: "center" },
    );

    // Download
    doc.save(`Invoice-${safePayment.id.slice(0, 8)}.pdf`);
  } catch (error) {
    console.error("Error generating invoice:", error);
    throw error;
  }
};

export const generateReceipt = (payment: PaymentData) => {
  try {
    const safePayment = getSafePaymentData(payment);
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Company Header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("WeTrain Education", pageWidth / 2, 20, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Professional Training & Development", pageWidth / 2, 27, {
      align: "center",
    });
    doc.text("Email: info@wetraineducation.com", pageWidth / 2, 32, {
      align: "center",
    });

    // Receipt Title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 128, 0);
    doc.text("PAYMENT RECEIPT", pageWidth / 2, 50, { align: "center" });
    doc.setTextColor(0, 0, 0);

    // Receipt Details
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Receipt Number: RCP-${safePayment.id.slice(0, 8).toUpperCase()}`,
      14,
      65,
    );
    doc.text(
      `Payment Date: ${new Date(safePayment.created_at).toLocaleDateString()}`,
      14,
      71,
    );
    doc.text(`Payment Method: ${safePayment.method.toUpperCase()}`, 14, 77);
    let yPos = 83;
    if (safePayment.reference) {
      doc.text(`Transaction Ref: ${safePayment.reference}`, 14, yPos);
      yPos += 6;
    }

    // Customer Details
    yPos += 9;
    doc.setFont("helvetica", "bold");
    doc.text("Received From:", 14, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(safePayment.profiles.full_name, 14, yPos + 6);
    doc.text(safePayment.profiles.email, 14, yPos + 12);
    if (safePayment.profiles?.phone) {
      doc.text(`Phone: ${safePayment.profiles.phone}`, 14, yPos + 18);
    }

    // Payment Details Box
    const boxY = yPos + 28;
    doc.setFillColor(240, 240, 240);
    doc.rect(14, boxY, pageWidth - 28, 40, "F");

    doc.setFont("helvetica", "bold");
    doc.text("Service:", 20, boxY + 10);
    doc.setFont("helvetica", "normal");
    doc.text(payment.service || "Service", 20, boxY + 16);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Amount Paid:", 20, boxY + 30);
    doc.setFontSize(18);
    doc.setTextColor(0, 128, 0);
    doc.text(
      `৳${safePayment.amount.toLocaleString("en-BD", { minimumFractionDigits: 2 })}`,
      20,
      boxY + 38,
    );
    doc.setTextColor(0, 0, 0);

    // Status Stamp
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 128, 0);
    doc.text("PAID", pageWidth - 50, boxY + 20, { align: "center" });
    doc.setLineWidth(2);
    doc.setDrawColor(0, 128, 0);
    doc.rect(pageWidth - 70, boxY + 5, 40, 20);

    // Footer
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(0, 0, 0);
    doc.text(
      "This is a computer-generated receipt and does not require a signature.",
      pageWidth / 2,
      doc.internal.pageSize.height - 30,
      { align: "center" },
    );
    doc.text(
      "For any queries, please contact us at info@wetraineducation.com",
      pageWidth / 2,
      doc.internal.pageSize.height - 24,
      { align: "center" },
    );

    // Download
    doc.save(`Receipt-${safePayment.id.slice(0, 8)}.pdf`);
  } catch (error) {
    console.error("Error generating receipt:", error);
    throw error;
  }
};
