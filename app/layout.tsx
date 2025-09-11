import "./globals.css";

export const metadata = {
  title: "Elite Marketing Solutions - Transform Your Brand's Digital Presence",
  description:
    "Professional marketing agency offering comprehensive digital solutions including SEO, social media marketing, content creation, and brand development. Elevate your business with our proven strategies.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased bg-quinary-yellow`}>
        {children}
      </body>
    </html>
  );
}
