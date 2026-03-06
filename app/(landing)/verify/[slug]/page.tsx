import type { Metadata } from "next";
import CertificateNotFoundCard from "../components/CertificateNotFoundCard";
import CertificateVerificationCard from "../components/CertificateVerificationCard";
import {
  getAllCertificateSlugs,
  getCertificateBySlug,
} from "../data/certificates";

interface VerifyCertificatePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllCertificateSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: VerifyCertificatePageProps): Promise<Metadata> {
  const { slug } = await params;
  const certificate = getCertificateBySlug(slug);

  if (!certificate) {
    return {
      title: "Certificate Not Found | WeTrainEducation & Tech OPC",
      description:
        "The certificate reference could not be found in the WeTrainEducation & Tech OPC verification system.",
    };
  }

  return {
    title: `Certificate Verification - ${certificate.refNo} | WeTrainEducation & Tech OPC`,
    description: `Verify the official ${certificate.certificateType.toLowerCase()} issued by WeTrainEducation & Tech OPC. Reference No: ${certificate.refNo}.`,
  };
}

export default async function VerifyCertificatePage({
  params,
}: VerifyCertificatePageProps) {
  const { slug } = await params;
  const certificate = getCertificateBySlug(slug);

  return (
    <>
      <section className="relative bg-gradient-to-b from-yellow-200 to-white py-20 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Certificate Verification
          </h1>
          <p className="text-lg text-gray-700">
            Verify official documents issued by WeTrainEducation & Tech OPC
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto pb-20 px-6">
        {certificate ? (
          <CertificateVerificationCard certificate={certificate} />
        ) : (
          <CertificateNotFoundCard slug={slug} />
        )}

        <div className="mt-8 border border-yellow-300 rounded-lg bg-yellow-50 p-6 md:p-8 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Company Contact
          </h2>
          <div className="text-gray-700 leading-7 space-y-1">
            <p className="font-semibold">WeTrainEducation & Tech OPC</p>
            <p>Usha-Tara Kunju, 1 no. C&amp;B Pole, C&amp;B Road, Barishal</p>
            <p>
              Email:{" "}
              <a
                href="mailto:support@wetraineducation.com"
                className="font-medium text-gray-900 hover:text-yellow-700"
              >
                support@wetraineducation.com
              </a>
            </p>
            <p>
              Website:{" "}
              <a
                href="https://www.wetraineducation.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-gray-900 hover:text-yellow-700"
              >
                www.wetraineducation.com
              </a>
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-gray-700 leading-6">
          If you have any questions regarding this verification, please contact
          the company directly.
        </p>
      </section>
    </>
  );
}
