"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertCircle,
  CheckCircle,
  Download,
  FileSpreadsheet,
  Loader2,
  Upload,
  UserCheck,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import * as XLSX from "xlsx";
import { importLeadsBatch } from "../../_actions/import";
import AdminPageHeader from "../../_components/AdminPageHeader";

interface ImportRow {
  name: string;
  phone: string;
  email?: string;
  company?: string;
}

interface ImportError {
  row: number;
  name: string;
  reason: string;
}

interface ImportProgress {
  processed: number;
  total: number;
  success: number;
  skipped: number;
  failed: number;
  currentLead: string;
  errors: ImportError[];
}

interface Marketer {
  id: string;
  full_name: string;
  email: string;
}

interface ImportPageClientProps {
  marketers: Marketer[];
}

export function ImportPageClient({ marketers }: ImportPageClientProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [allErrors, setAllErrors] = useState<ImportError[]>([]);
  const [results, setResults] = useState<{
    success: number;
    skipped: number;
    failed: number;
    errors: ImportError[];
  } | null>(null);

  // Marketer selection states
  const [assignmentMode, setAssignmentMode] = useState<
    "none" | "all" | "select"
  >("all");
  const [selectedMarketers, setSelectedMarketers] = useState<string[]>(
    marketers.map((m) => m.id),
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const isCSV = selectedFile.name.endsWith(".csv");
      const isXLSX =
        selectedFile.name.endsWith(".xlsx") ||
        selectedFile.name.endsWith(".xls");

      if (!isCSV && !isXLSX) {
        toast.error("Please select a CSV or Excel file");
        return;
      }
      setFile(selectedFile);
      setResults(null);
    }
  };

  const parseFile = async (file: File): Promise<ImportRow[]> => {
    const isCSV = file.name.endsWith(".csv");
    const isXLSX = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");

    if (isCSV) {
      const text = await file.text();
      return parseCSV(text);
    } else if (isXLSX) {
      return parseExcel(file);
    }

    throw new Error("Unsupported file format");
  };

  const parseExcel = async (file: File): Promise<ImportRow[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          // Convert to JSON with header row
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
          }) as (string | number | null | undefined)[][];

          if (jsonData.length < 2) {
            reject(new Error("Excel file is empty or has no data"));
            return;
          }

          const headers = jsonData[0].map((h) =>
            String(h || "")
              .trim()
              .toLowerCase(),
          );
          const rows: ImportRow[] = [];

          for (let i = 1; i < jsonData.length; i++) {
            const rowData = jsonData[i];
            const row: Record<string, string> = {};

            headers.forEach((header, index) => {
              const value = rowData[index];
              row[header] =
                value !== undefined && value !== null ? String(value) : "";
            });

            // Support multiple CSV formats
            const firstName = row["first name"] || row.firstname || "";
            const lastName = row["last name"] || row.lastname || "";
            const fullName =
              firstName && lastName
                ? `${firstName} ${lastName}`.trim()
                : row.name ||
                  row["full name"] ||
                  row["lead name"] ||
                  firstName ||
                  lastName ||
                  "";

            rows.push({
              name: fullName,
              phone: row["phone number"] || row.phone || row.mobile || "",
              email: row.email || row["email address"] || "",
              company:
                row["company name"] || row.company || row.organization || "",
            });
          }

          resolve(rows);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error("Failed to read Excel file"));
      reader.readAsArrayBuffer(file);
    });
  };

  const parseCSV = (text: string): ImportRow[] => {
    const lines = text.split("\n").filter((line) => line.trim());
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

    const rows: ImportRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => {
        const trimmed = v.trim();
        // Convert scientific notation to normal number
        if (trimmed.includes("E+") || trimmed.includes("e+")) {
          try {
            return parseFloat(trimmed).toFixed(0);
          } catch {
            return trimmed;
          }
        }
        return trimmed;
      });
      const row: Record<string, string> = {};

      headers.forEach((header, index) => {
        row[header] = values[index] || "";
      });

      // Support multiple CSV formats
      const firstName = row["first name"] || row.firstname || "";
      const lastName = row["last name"] || row.lastname || "";
      const fullName =
        firstName && lastName
          ? `${firstName} ${lastName}`.trim()
          : row.name ||
            row["full name"] ||
            row["lead name"] ||
            firstName ||
            lastName ||
            "";

      rows.push({
        name: fullName,
        phone: row["phone number"] || row.phone || row.mobile || "",
        email: row.email || row["email address"] || "",
        company: row["company name"] || row.company || row.organization || "",
      });
    }

    return rows;
  };

  const handleImport = async () => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    // Validate marketer selection
    if (assignmentMode === "select" && selectedMarketers.length === 0) {
      toast.error("Please select at least one marketer");
      return;
    }

    setLoading(true);
    setImporting(true);
    setAllErrors([]);
    setResults(null);

    try {
      const rows = await parseFile(file);

      if (rows.length === 0) {
        toast.error("No valid rows found in file");
        setLoading(false);
        setImporting(false);
        return;
      }

      // Initialize progress
      setProgress({
        processed: 0,
        total: rows.length,
        success: 0,
        skipped: 0,
        failed: 0,
        currentLead: "",
        errors: [],
      });

      let totalSuccess = 0;
      let totalSkipped = 0;
      let totalFailed = 0;
      const accumulatedErrors: ImportError[] = [];
      let currentIndex = 0;

      // Determine which marketers to use
      const marketerIds =
        assignmentMode === "none"
          ? []
          : assignmentMode === "all"
            ? marketers.map((m) => m.id)
            : selectedMarketers;

      // Process in batches
      while (currentIndex < rows.length) {
        const result = await importLeadsBatch(rows, currentIndex, marketerIds);

        if (result.error) {
          toast.error(result.error);
          setImporting(false);
          setLoading(false);
          return;
        }

        if (result.data) {
          totalSuccess += result.data.success;
          totalSkipped += result.data.skipped;
          totalFailed += result.data.failed;
          accumulatedErrors.push(...result.data.errors);

          // Update progress
          setProgress({
            processed: result.data.processed,
            total: result.data.total,
            success: totalSuccess,
            skipped: totalSkipped,
            failed: totalFailed,
            currentLead: result.data.currentLead,
            errors: result.data.errors,
          });

          setAllErrors(accumulatedErrors);
        }

        if (result.done) {
          // Final results
          setResults({
            success: totalSuccess,
            skipped: totalSkipped,
            failed: totalFailed,
            errors: accumulatedErrors,
          });

          toast.success(
            `Import complete! ${totalSuccess} leads imported, ${totalSkipped} skipped, ${totalFailed} failed.`,
          );
          router.refresh();
          break;
        }

        currentIndex += 50; // BATCH_SIZE
      }
    } catch (error) {
      toast.error("Failed to parse file");
      console.error(error);
    } finally {
      setLoading(false);
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const csv =
      "First Name,Last Name,Phone Number,Company name\nJohn,Doe,01712345678,ABC Corp\nJane,Smith,+8801823456789,XYZ Ltd\nMd,Rahman,8801934567890,Tech Solutions";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lead-import-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Import Leads"
        description="Bulk import leads from CSV/Excel with automatic round-robin assignment"
      />

      {/* Progress Dialog */}
      <Dialog open={importing} onOpenChange={() => {}}>
        <DialogContent
          className="max-w-2xl"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Importing Leads...</DialogTitle>
            <DialogDescription>
              Please wait while we process your file
            </DialogDescription>
          </DialogHeader>

          {progress && (
            <div className="space-y-6 py-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>
                    Processing: {progress.processed} / {progress.total}
                  </span>
                  <span>
                    {Math.round((progress.processed / progress.total) * 100)}%
                  </span>
                </div>
                <Progress
                  value={(progress.processed / progress.total) * 100}
                  className="h-2"
                />
              </div>

              {/* Current Lead */}
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing: {progress.currentLead}</span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-lg font-bold text-green-700">
                      {progress.success}
                    </p>
                    <p className="text-xs text-green-600">Imported</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-lg font-bold text-yellow-700">
                      {progress.skipped}
                    </p>
                    <p className="text-xs text-yellow-600">Skipped</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-lg font-bold text-red-700">
                      {progress.failed}
                    </p>
                    <p className="text-xs text-red-600">Failed</p>
                  </div>
                </div>
              </div>

              {/* Recent Errors */}
              {allErrors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-slate-700">
                    Recent Issues ({allErrors.length} total):
                  </h4>
                  <ScrollArea className="h-32 rounded-md border bg-slate-50 p-3">
                    <div className="space-y-1 text-xs">
                      {allErrors
                        .slice(-10)
                        .reverse()
                        .map((error, i) => (
                          <div key={i} className="text-slate-600">
                            <span className="font-medium">
                              Row {error.row}:
                            </span>{" "}
                            {error.name} - {error.reason}
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="space-y-6">
        {/* Upload and Marketer Selection */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Upload CSV or Excel File</CardTitle>
              <CardDescription>
                Import leads in bulk from CSV or Excel. Duplicates will be
                automatically skipped.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                {file ? (
                  <div className="space-y-2">
                    <FileSpreadsheet className="h-12 w-12 mx-auto text-green-500" />
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-slate-500">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFile(null)}
                      disabled={loading}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-12 w-12 mx-auto text-slate-400" />
                    <p className="text-sm text-slate-600">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-slate-500">
                      CSV or Excel files (.csv, .xlsx)
                    </p>
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileChange}
                      className="hidden"
                      id="csv-upload"
                      disabled={loading}
                    />
                    <label htmlFor="csv-upload">
                      <Button variant="outline" size="sm" asChild>
                        <span>Select File</span>
                      </Button>
                    </label>
                  </div>
                )}
              </div>

              <Button
                onClick={handleImport}
                disabled={!file || loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Import Leads
                  </>
                )}
              </Button>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {assignmentMode === "none"
                    ? "Leads will be imported without assignment (un-assigned)."
                    : assignmentMode === "all"
                      ? "Leads will be automatically assigned to all marketers using round-robin distribution."
                      : `Leads will be assigned to ${
                          selectedMarketers.length
                        } selected marketer${
                          selectedMarketers.length !== 1 ? "s" : ""
                        } using round-robin.`}{" "}
                  Phone numbers will be normalized to BD format (+880).
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Marketer Assignment
              </CardTitle>
              <CardDescription>
                Choose how to assign imported leads to marketers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={assignmentMode}
                onValueChange={(value) => {
                  setAssignmentMode(value as "none" | "all" | "select");
                  if (value === "all") {
                    setSelectedMarketers(marketers.map((m) => m.id));
                  } else if (value === "none") {
                    setSelectedMarketers([]);
                  }
                }}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="none" id="none" />
                  <Label htmlFor="none" className="font-normal cursor-pointer">
                    None - Import as un-assigned
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all" className="font-normal cursor-pointer">
                    All Marketers - Assign to all ({marketers.length} marketers)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="select" id="select" />
                  <Label
                    htmlFor="select"
                    className="font-normal cursor-pointer"
                  >
                    Select Specific Marketers
                  </Label>
                </div>
              </RadioGroup>

              {assignmentMode === "select" && (
                <div className="space-y-3 pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      Select Marketers ({selectedMarketers.length} selected)
                    </Label>
                    <div className="space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setSelectedMarketers(marketers.map((m) => m.id))
                        }
                      >
                        Select All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedMarketers([])}
                      >
                        Clear All
                      </Button>
                    </div>
                  </div>
                  <ScrollArea className="h-48 rounded-md border p-3">
                    <div className="space-y-3">
                      {marketers.map((marketer) => (
                        <div
                          key={marketer.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={marketer.id}
                            checked={selectedMarketers.includes(marketer.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedMarketers([
                                  ...selectedMarketers,
                                  marketer.id,
                                ]);
                              } else {
                                setSelectedMarketers(
                                  selectedMarketers.filter(
                                    (id) => id !== marketer.id,
                                  ),
                                );
                              }
                            }}
                          />
                          <Label
                            htmlFor={marketer.id}
                            className="text-sm font-normal cursor-pointer flex-1"
                          >
                            <div>
                              <div className="font-medium">
                                {marketer.full_name}
                              </div>
                              <div className="text-xs text-slate-500">
                                {marketer.email}
                              </div>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {marketers.length === 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No marketers available. Leads will be imported as
                    un-assigned.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* CSV Format Guide */}
        <Card>
          <CardHeader>
            <CardTitle>CSV Format</CardTitle>
            <CardDescription>Required columns for import</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Required Columns:</h4>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>
                  •{" "}
                  <code className="bg-slate-100 px-1 rounded">First Name</code>{" "}
                  - Lead&apos;s first name
                </li>
                <li>
                  • <code className="bg-slate-100 px-1 rounded">Last Name</code>{" "}
                  - Lead&apos;s last name
                </li>
                <li>
                  •{" "}
                  <code className="bg-slate-100 px-1 rounded">
                    Phone Number
                  </code>{" "}
                  - BD phone (will be normalized to +880)
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Optional Columns:</h4>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>
                  •{" "}
                  <code className="bg-slate-100 px-1 rounded">
                    Company name
                  </code>{" "}
                  - Company/Organization
                </li>
                <li>
                  • Also supports:{" "}
                  <code className="bg-slate-100 px-1 rounded text-xs">
                    name
                  </code>
                  ,{" "}
                  <code className="bg-slate-100 px-1 rounded text-xs">
                    phone
                  </code>
                  ,{" "}
                  <code className="bg-slate-100 px-1 rounded text-xs">
                    email
                  </code>
                </li>
              </ul>
            </div>

            <Button
              variant="outline"
              onClick={downloadTemplate}
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>

            <div className="bg-slate-50 p-4 rounded-md text-xs font-mono overflow-x-auto">
              First Name,Last Name,Phone Number,Company name
              <br />
              John,Doe,01712345678,ABC Corp
              <br />
              Md,Rahman,8801934567890,Tech Solutions
            </div>
          </CardContent>
        </Card>
      </div>

      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Import Results</CardTitle>
            <CardDescription>Summary of the import operation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold text-green-700">
                    {results.success}
                  </p>
                  <p className="text-sm text-green-600">Imported</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg">
                <AlertCircle className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold text-yellow-700">
                    {results.skipped}
                  </p>
                  <p className="text-sm text-yellow-600">
                    Skipped (Duplicates)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
                <XCircle className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-2xl font-bold text-red-700">
                    {results.failed}
                  </p>
                  <p className="text-sm text-red-600">Failed</p>
                </div>
              </div>
            </div>

            {results.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-slate-700">
                  Issues & Errors ({results.errors.length} total):
                </h4>
                <ScrollArea className="h-60 rounded-md border bg-slate-50 p-4">
                  <div className="space-y-2">
                    {results.errors.map((error, i) => (
                      <div
                        key={i}
                        className="text-sm border-b border-slate-200 pb-2 last:border-0"
                      >
                        <div className="flex items-start gap-2">
                          <span className="font-mono text-xs bg-slate-200 px-1.5 py-0.5 rounded">
                            Row {error.row}
                          </span>
                          <div className="flex-1">
                            <p className="font-medium text-slate-700">
                              {error.name}
                            </p>
                            <p className="text-xs text-red-600 mt-0.5">
                              {error.reason}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
