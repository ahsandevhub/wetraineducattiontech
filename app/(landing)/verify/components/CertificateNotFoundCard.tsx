import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

interface CertificateNotFoundCardProps {
  slug: string;
}

export default function CertificateNotFoundCard({
  slug,
}: CertificateNotFoundCardProps) {
  return (
    <div className="border border-yellow-300 rounded-lg bg-yellow-50 p-6 md:p-8 shadow-sm text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white border border-yellow-200">
        <AlertCircle className="h-6 w-6 text-yellow-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900">
        Certificate Not Found
      </h2>
      <p className="mt-3 text-gray-700 leading-7">
        The certificate reference you are looking for could not be found in our
        verification system.
      </p>
      <p className="mt-2 text-sm text-gray-600 break-all">
        Requested slug:{" "}
        <span className="font-semibold text-gray-900">{slug}</span>
      </p>
      <p className="mt-4 text-sm text-gray-700 leading-6">
        If you believe this is an error, please contact WeTrainEducation & Tech
        OPC for manual verification support.
      </p>
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button
          asChild
          className="bg-yellow-500 text-gray-900 hover:bg-yellow-600"
        >
          <Link href="/">Back to Home</Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="border-yellow-300 text-gray-900 hover:bg-yellow-100"
        >
          <Link href="/about">Contact Company</Link>
        </Button>
      </div>
    </div>
  );
}
