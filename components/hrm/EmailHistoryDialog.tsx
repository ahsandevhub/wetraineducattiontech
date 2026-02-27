"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, Loader2, Mail, RotateCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

interface EmailLog {
  id: string;
  emailType: string;
  subjectLine: string;
  htmlContent: string;
  textContent: string;
  sentAt: string;
  recipientEmail: string;
  deliveryStatus: string;
  sentByAdmin: {
    full_name: string;
    email: string;
  } | null;
}

interface EmailHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjectName: string;
  subjectEmail: string;
  monthKey: string;
  subjectUserId: string;
}

export function EmailHistoryDialog({
  open,
  onOpenChange,
  subjectName,
  subjectEmail,
  monthKey,
  subjectUserId,
}: EmailHistoryDialogProps) {
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [viewingEmail, setViewingEmail] = useState<EmailLog | null>(null);
  const [resending, setResending] = useState<string | null>(null);

  const fetchEmailLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/hrm/super/email-logs?subjectUserId=${subjectUserId}&monthKey=${monthKey}`,
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch email logs");
      }

      setEmailLogs(data.emailLogs || []);
      if (data.latestEmail) {
        setViewingEmail(data.latestEmail);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load email history";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [subjectUserId, monthKey]);

  useEffect(() => {
    if (open) {
      fetchEmailLogs();
    }
  }, [open, fetchEmailLogs]);

  // Reset viewing email when switching subjects
  useEffect(() => {
    setViewingEmail(null);
  }, [subjectUserId]);

  const handleSendEmail = async () => {
    setSending(true);
    try {
      const res = await fetch(
        `/api/hrm/super/send-marksheet-email?subjectUserId=${subjectUserId}&monthKey=${monthKey}`,
        {
          method: "POST",
        },
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send email");
      }

      toast.success("Email sent successfully!");
      await fetchEmailLogs();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to send email";
      toast.error(message);
    } finally {
      setSending(false);
    }
  };

  const handleResendEmail = async (emailLogId: string) => {
    setResending(emailLogId);
    try {
      const res = await fetch(
        `/api/hrm/super/resend-email?emailLogId=${emailLogId}`,
        {
          method: "POST",
        },
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to resend email");
      }

      toast.success("Email resent successfully!");
      await fetchEmailLogs();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to resend email";
      toast.error(message);
    } finally {
      setResending(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="space-y-2">
            <DialogTitle>Email History & Marksheet</DialogTitle>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>
                <span className="font-medium">{subjectName}</span>
                <span className="text-xs ml-2">{subjectEmail}</span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-hidden flex flex-col gap-4">
          {/* Email History List */}
          <div className="border rounded-lg overflow-hidden flex flex-col shrink-0">
            <div className="bg-muted p-3 flex items-center justify-between shrink-0">
              <h3 className="font-semibold text-sm">Email History</h3>
              <Button
                size="sm"
                onClick={handleSendEmail}
                disabled={sending || loading}
                className="gap-2"
              >
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4" />
                    Send Email
                  </>
                )}
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8 flex-1 shrink-0">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : emailLogs.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground flex-1 flex items-center justify-center shrink-0">
                <div>
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No emails sent yet for this month</p>
                  <p className="text-xs mt-1">
                    Click &quot;Send Email&quot; to send the marksheet
                  </p>
                </div>
              </div>
            ) : (
              <div className="max-h-32 overflow-y-auto">
                <div className="divide-y">
                  {emailLogs.map((log) => (
                    <div
                      key={log.id}
                      onClick={() => setViewingEmail(log)}
                      className={`p-3 cursor-pointer transition-colors ${
                        viewingEmail?.id === log.id
                          ? "bg-primary/5 border-l-2 border-primary"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {log.subjectLine}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(log.sentAt)}
                          </div>
                        </div>
                        <Badge
                          variant={
                            log.deliveryStatus === "SENT"
                              ? "default"
                              : "destructive"
                          }
                          className="whitespace-nowrap text-xs"
                        >
                          {log.deliveryStatus}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Email Content Preview */}
          {viewingEmail && (
            <div className="border rounded-lg overflow-hidden flex flex-col flex-1 min-h-0">
              <div className="bg-muted p-3 flex items-center justify-between shrink-0">
                <h3 className="font-semibold text-sm">Email Preview</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleResendEmail(viewingEmail.id)}
                  disabled={resending === viewingEmail.id}
                  className="gap-2"
                >
                  {resending === viewingEmail.id ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Resending...
                    </>
                  ) : (
                    <>
                      <RotateCw className="h-4 w-4" />
                      Resend
                    </>
                  )}
                </Button>
              </div>
              <ScrollArea className="flex-1">
                <div
                  className="p-4"
                  dangerouslySetInnerHTML={{ __html: viewingEmail.htmlContent }}
                />
              </ScrollArea>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t pt-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
