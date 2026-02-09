import jsPDF from "jspdf";
import type { CustomerPaymentRow, CustomerProfile } from "../../types";

export async function generatePaymentPDF(
  payment: CustomerPaymentRow,
  profile: CustomerProfile,
): Promise<Blob> {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  // Helper function to add text with wrapping
  const addText = (
    text: string,
    x: number,
    y: number,
    options: Record<string, unknown> = {},
  ) => {
    pdf.text(text, x, y, options);
  };

  // Header
  addText("INVOICE", margin, margin + 10, { fontSize: 24, fontStyle: "bold" });

  // Company Info
  addText("WeTrain Education", margin, margin + 30, {
    fontSize: 12,
    fontStyle: "bold",
  });
  addText("Bangladesh", margin, margin + 37, { fontSize: 10 });
  addText("support@wetrain.edu", margin, margin + 44, { fontSize: 10 });

  // Invoice Details (Right aligned)
  const rightAlign = margin + contentWidth;
  addText("Invoice #:", rightAlign - 40, margin + 30, { fontSize: 10 });
  addText(payment.reference.substring(0, 20), rightAlign, margin + 30, {
    fontSize: 10,
    align: "right",
  });

  addText("Date:", rightAlign - 40, margin + 37, { fontSize: 10 });
  addText(
    payment.createdAt
      ? new Date(payment.createdAt).toLocaleDateString()
      : "N/A",
    rightAlign,
    margin + 37,
    { fontSize: 10, align: "right" },
  );

  addText("Status:", rightAlign - 40, margin + 44, { fontSize: 10 });
  addText(payment.status.toUpperCase(), rightAlign, margin + 44, {
    fontSize: 10,
    align: "right",
    fontStyle: "bold",
  });

  // Bill To Section
  let yPosition = margin + 65;
  addText("BILL TO:", margin, yPosition, { fontSize: 11, fontStyle: "bold" });
  yPosition += 8;
  addText(profile.fullName || "Customer", margin, yPosition, { fontSize: 10 });
  yPosition += 7;
  addText(profile.email, margin, yPosition, { fontSize: 10 });
  if (profile.phone) {
    yPosition += 7;
    addText(profile.phone, margin, yPosition, { fontSize: 10 });
  }

  // Items Table Header
  yPosition += 20;
  pdf.setFillColor(240, 240, 240);
  pdf.rect(margin, yPosition - 5, contentWidth, 8, "F");

  addText("Description", margin + 3, yPosition + 1, {
    fontSize: 10,
    fontStyle: "bold",
  });
  addText("Amount", rightAlign - 30, yPosition + 1, {
    fontSize: 10,
    fontStyle: "bold",
    align: "right",
  });

  // Items
  yPosition += 12;
  addText("Payment Transaction", margin + 3, yPosition, { fontSize: 10 });
  const formattedAmount = `৳${payment.amount.toLocaleString()}`;
  addText(formattedAmount, rightAlign - 30, yPosition, {
    fontSize: 10,
    align: "right",
  });

  // Payment Method
  yPosition += 10;
  addText(
    `Payment Method: ${payment.method.toUpperCase()}`,
    margin,
    yPosition,
    {
      fontSize: 9,
      fontStyle: "italic",
    },
  );

  // Totals Section
  yPosition += 20;
  pdf.setDrawColor(200, 200, 200);
  pdf.line(margin, yPosition - 2, rightAlign, yPosition - 2);

  yPosition += 5;
  addText("Total Amount:", rightAlign - 50, yPosition, {
    fontSize: 11,
    fontStyle: "bold",
  });
  addText(formattedAmount, rightAlign - 30, yPosition, {
    fontSize: 11,
    fontStyle: "bold",
    align: "right",
  });

  // Footer
  const footerY = pageHeight - margin - 15;
  pdf.setFontSize(8);
  pdf.setDrawColor(200, 200, 200);
  pdf.line(margin, footerY, rightAlign, footerY);

  addText(
    "Thank you for your payment. This is an automated receipt.",
    pageWidth / 2,
    footerY + 8,
    { fontSize: 8, align: "center" },
  );
  addText(
    "WeTrain Education | www.wetrain.edu | support@wetrain.edu",
    pageWidth / 2,
    footerY + 14,
    { fontSize: 8, align: "center" },
  );

  return pdf.output("blob");
}
