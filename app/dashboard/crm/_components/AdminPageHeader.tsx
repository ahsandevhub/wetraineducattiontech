import { Button } from "@/components/ui/button";
import { Undo2, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

type Breadcrumb = {
  label: string;
  href?: string;
};

type AdminPageHeaderProps = {
  title: string;
  description: string;
  breadcrumbs?: Breadcrumb[];
  backHref?: string;
  action?:
    | {
        label: string;
        href: string;
        icon?: LucideIcon;
      }
    | ReactNode;
};

/**
 * Reusable admin page header component
 * Used across admin pages for consistent layout
 * Includes breadcrumbs and optional back button
 */
export function AdminPageHeader({
  title,
  description,
  breadcrumbs,
  backHref,
  action,
}: AdminPageHeaderProps) {
  return (
    <div>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center text-sm text-muted-foreground mb-4">
          {breadcrumbs.map((breadcrumb, index) => (
            <div key={index} className="flex items-center">
              {index > 0 && (
                <span className="mx-2 text-muted-foreground/50">/</span>
              )}
              {breadcrumb.href ? (
                <Link
                  href={breadcrumb.href}
                  className="hover:text-foreground transition-colors"
                >
                  {breadcrumb.label}
                </Link>
              ) : (
                <span className="text-foreground">{breadcrumb.label}</span>
              )}
            </div>
          ))}
        </nav>
      )}

      {/* Header with back button */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <div className="flex items-center gap-3">
            {backHref && (
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="shrink-0 border size-11"
              >
                <Link href={backHref}>
                  <Undo2 className="size-6" />
                </Link>
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                {title}
              </h1>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
        </div>
        {action && (
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            {typeof action === "object" &&
            action !== null &&
            "href" in action ? (
              <Button asChild>
                <Link href={action.href}>
                  {action.icon && <action.icon className="mr-2 h-4 w-4" />}
                  {action.label}
                </Link>
              </Button>
            ) : (
              action
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPageHeader;
