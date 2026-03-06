import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import type { CertificateRecord } from "../data/certificates";

interface CertificateVerificationCardProps {
  certificate: CertificateRecord;
}

export default function CertificateVerificationCard({
  certificate,
}: CertificateVerificationCardProps) {
  type DetailItem = { label: string; value: string; isStatus?: boolean };

  const statusColorClass =
    certificate.status === "Verified"
      ? "text-green-600"
      : certificate.status === "Pending"
        ? "text-yellow-600"
        : "text-red-600";

  const extraDetails: DetailItem[] = Object.entries(
    certificate.extraFields ?? {},
  ).map(([label, value]) => ({ label, value }));

  const details: DetailItem[] = [
    { label: "Certificate Type", value: certificate.certificateType },
    { label: "Name", value: certificate.name },
    { label: "Father's Name", value: certificate.fatherName },
    { label: "NID No", value: certificate.nidNo },
    { label: "Passport No", value: certificate.passportNo },
    { label: "Company", value: certificate.company },
    { label: "Designation", value: certificate.designation },
    { label: "Joining Date", value: certificate.joiningDate },
    { label: "Issue Date", value: certificate.issueDate },
    { label: "Status", value: certificate.status, isStatus: true },
  ];

  const allDetails: DetailItem[] = [...details, ...extraDetails];

  return (
    <div className="border border-yellow-300 rounded-lg bg-yellow-50 p-6 md:p-8 shadow-sm">
      <div className="flex flex-col items-center text-center gap-3 border-b border-yellow-200 pb-6">
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border border-green-200 px-3 py-1 text-sm">
          <CheckCircle2 className="h-4 w-4" />
          Certificate Verified
        </Badge>
        <p className="text-sm text-gray-600">
          Official verification record issued by WeTrainEducation & Tech OPC
        </p>
      </div>

      <div className="mt-6 rounded-lg border border-yellow-200 bg-white px-4 py-3">
        <p className="text-xs uppercase tracking-wide text-gray-500">
          Reference No
        </p>
        <p className="text-lg md:text-xl font-bold text-gray-900 break-all">
          {certificate.refNo}
        </p>
      </div>

      <dl className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {allDetails.map((detail) => (
          <div
            key={detail.label}
            className="rounded-lg border border-yellow-200 bg-white p-4"
          >
            <dt className="text-sm font-medium text-gray-500">
              {detail.label}
            </dt>
            <dd
              className={
                detail.isStatus
                  ? `mt-1 text-base font-semibold ${statusColorClass}`
                  : "mt-1 text-base font-semibold text-gray-900"
              }
            >
              {detail.value}
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-6 text-sm text-gray-700 leading-6">{certificate.note}</p>
    </div>
  );
}
