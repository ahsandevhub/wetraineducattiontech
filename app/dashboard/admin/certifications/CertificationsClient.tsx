"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, MoreHorizontal, Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { toast } from "react-hot-toast";
import { ConfirmDialog } from "../_components/ConfirmDialog";
import TablePagination from "../_components/TablePagination";
import {
  createCertification,
  deleteCertification,
  updateCertification,
} from "../actions";
import type { AdminCertificationRow } from "../types";
import CertificationDialog, {
  type CertificationFormValues,
} from "./CertificationDialog";

type CertificationsClientProps = {
  certifications: AdminCertificationRow[];
};

export default function CertificationsClient({
  certifications,
}: CertificationsClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const certSearch = searchParams.get("certSearch") ?? "";
  const certPage = parseInt(searchParams.get("certPage") ?? "1");
  const certRowsPerPage = parseInt(searchParams.get("certRowsPerPage") ?? "10");

  const [searchValue, setSearchValue] = useState(certSearch);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<AdminCertificationRow | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] =
    useState<AdminCertificationRow | null>(null);
  const [actionLoading, setActionLoading] = useState<{
    id: string;
    type: "save" | "delete";
  } | null>(null);

  const updateParams = useCallback(
    (newParams: Record<string, string | number | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(newParams).forEach(([key, value]) => {
        if (value === null) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });
      startTransition(() => {
        router.push(`?${params.toString()}`);
      });
    },
    [searchParams, router],
  );

  useEffect(() => {
    setSearchValue(certSearch);
  }, [certSearch]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchValue === certSearch) return;
      updateParams({ certSearch: searchValue || null, certPage: 1 });
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [searchValue, certSearch, updateParams]);

  const filteredCerts = useMemo(() => {
    const query = certSearch.toLowerCase();
    return certifications.filter((cert) => {
      if (!query) return true;
      return (
        cert.title.toLowerCase().includes(query) ||
        cert.issuer.toLowerCase().includes(query)
      );
    });
  }, [certifications, certSearch]);

  const startIndex = (certPage - 1) * certRowsPerPage;
  const paginated = filteredCerts.slice(
    startIndex,
    startIndex + certRowsPerPage,
  );
  const totalPages = Math.ceil(filteredCerts.length / certRowsPerPage);

  const handleSave = (values: CertificationFormValues) => {
    const isEdit = Boolean(editingCert);
    setActionLoading({ id: editingCert?.id ?? "new", type: "save" });
    startTransition(async () => {
      try {
        if (isEdit && editingCert) {
          await updateCertification(editingCert.id, {
            title: values.title,
            issuer: values.issuer,
            issuedAt: values.issuedAt,
            description: values.description,
            credentialId: values.credentialId || null,
            verifyUrl: values.verifyUrl || null,
            imageUrl: values.imageUrl || null,
          });
          toast.success("Certification updated");
        } else {
          await createCertification({
            title: values.title,
            issuer: values.issuer,
            issuedAt: values.issuedAt,
            description: values.description,
            credentialId: values.credentialId || null,
            verifyUrl: values.verifyUrl || null,
            imageUrl: values.imageUrl || null,
          });
          toast.success("Certification created");
        }
        setDialogOpen(false);
        setEditingCert(null);
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to save certification",
        );
      } finally {
        setActionLoading(null);
      }
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setActionLoading({ id: deleteTarget.id, type: "delete" });
    startTransition(async () => {
      try {
        await deleteCertification(deleteTarget.id);
        toast.success("Certification deleted");
        setDeleteTarget(null);
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to delete certification",
        );
      } finally {
        setActionLoading(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Certifications</h1>
          <p className="text-sm text-gray-600">
            Manage company certifications and credentials.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingCert(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Certification
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Certifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Search by title or issuer..."
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            className="max-w-xs"
          />

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-semibold text-gray-900">
                    Title
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    Issuer
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    Issued At
                  </TableHead>
                  <TableHead className="text-right font-semibold text-gray-900">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((cert) => (
                  <TableRow key={cert.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-gray-900">
                      {cert.title}
                    </TableCell>
                    <TableCell>{cert.issuer}</TableCell>
                    <TableCell>{cert.issuedAt}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={
                              actionLoading?.id === cert.id &&
                              actionLoading.type === "save"
                            }
                          >
                            {actionLoading?.id === cert.id &&
                            actionLoading.type === "save" ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <MoreHorizontal className="h-4 w-4" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingCert(cert);
                              setDialogOpen(true);
                            }}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => setDeleteTarget(cert)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {paginated.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10">
                      <div className="text-sm text-gray-500">
                        No certifications found.
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <TablePagination
            currentPage={certPage}
            totalPages={totalPages}
            rowsPerPage={certRowsPerPage}
            totalRows={filteredCerts.length}
            onPageChange={(page) => updateParams({ certPage: page })}
            onRowsPerPageChange={(rows) =>
              updateParams({ certRowsPerPage: rows, certPage: 1 })
            }
          />
        </CardContent>
      </Card>

      <CertificationDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingCert(null);
        }}
        certification={editingCert}
        isSaving={isPending || actionLoading?.type === "save"}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete certification"
        description={`Are you sure you want to delete ${deleteTarget?.title ?? "this certification"}? This action cannot be undone.`}
        confirmText={
          actionLoading?.type === "delete" ? "Deleting..." : "Delete"
        }
        isLoading={actionLoading?.type === "delete"}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
