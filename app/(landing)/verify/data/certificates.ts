export interface CertificateRecord {
  slug: string;
  refNo: string;
  certificateType: string;
  name: string;
  fatherName: string;
  nidNo: string;
  passportNo: string;
  company: string;
  designation: string;
  joiningDate: string;
  status: "Verified" | "Pending" | "Revoked";
  issueDate: string;
  note: string;
  extraFields?: Record<string, string>;
}

export const certificateRecords: CertificateRecord[] = [
  {
    slug: "wet-exp-2026-0304-001",
    refNo: "WET/EXP/2026/0304-001",
    certificateType: "Experience Certificate",
    name: "Shariful Islam",
    fatherName: "Hafiz Mominul Islam",
    nidNo: "6917088491",
    passportNo: "A21565928",
    company: "WeTrainEducation & Tech OPC",
    designation: "Computer Operator",
    joiningDate: "1 July 2020",
    status: "Verified",
    issueDate: "04 March 2026",
    note: "This certificate has been verified as an officially issued document of WeTrainEducation & Tech OPC.",
  },
];

export function getCertificateBySlug(slug: string): CertificateRecord | null {
  return (
    certificateRecords.find((certificate) => certificate.slug === slug) ?? null
  );
}

export function getAllCertificateSlugs(): string[] {
  return certificateRecords.map((certificate) => certificate.slug);
}
