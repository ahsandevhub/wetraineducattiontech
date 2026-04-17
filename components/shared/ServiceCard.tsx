"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPlaceholderImage, useImageError } from "@/hooks/useImageError";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type ServiceCardProps = {
  id: string;
  title: string;
  description?: string | null;
  features?: string[];
  imageUrl?: string | null;
  imageAlt?: string;
  categoryLabel: string;
  categoryClassName?: string;
  detailHref?: string;
  ctaHref?: string;
  ctaLabel: string;
  ctaDisabled?: boolean;
  ctaTitle?: string;
  ctaVariant?: "default" | "outline";
  priceLabel?: string | null;
  originalPriceLabel?: string | null;
  priceNote?: string | null;
  topLeftBadge?: ReactNode;
  topRightBadge?: ReactNode;
  className?: string;
};

export default function ServiceCard({
  id,
  title,
  features = [],
  imageUrl,
  imageAlt,
  categoryLabel,
  categoryClassName,
  detailHref,
  ctaHref,
  ctaLabel,
  ctaDisabled = false,
  ctaTitle,
  ctaVariant = "default",
  priceLabel,
  originalPriceLabel,
  priceNote,
  topLeftBadge,
  topRightBadge,
  className,
}: ServiceCardProps) {
  const { handleImageError, hasError } = useImageError();
  const visibleFeatures = features.slice(0, 5);
  const canShowImage = Boolean(imageUrl) && !hasError(id);

  const CardBody = (
    <div
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-yellow-300 hover:shadow-xl",
        className,
      )}
    >
      <div className="relative overflow-hidden bg-gradient-to-br from-yellow-100 via-white to-orange-50">
        <div className="relative aspect-video w-full">
          {canShowImage ? (
            <>
              <Image
                src={imageUrl!}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="scale-110 object-cover blur-2xl"
                onError={() => handleImageError(id)}
              />
              <div className="absolute inset-0 bg-white/10" />
              <Image
                src={imageUrl!}
                alt={imageAlt ?? title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
                onError={() => handleImageError(id)}
              />
            </>
          ) : (
            <Image
              src={getPlaceholderImage("service")}
              alt={imageAlt ?? title}
              fill
              className="object-cover"
            />
          )}
          {topLeftBadge ? (
            <div className="absolute left-3 top-3">{topLeftBadge}</div>
          ) : null}
          {topRightBadge ? (
            <div className="absolute right-3 top-3">{topRightBadge}</div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <Badge className={cn("border-0", categoryClassName)}>
            {categoryLabel}
          </Badge>
        </div>

        {detailHref ? (
          <Link href={detailHref} className="mb-2 block">
            <h3 className="text-xl font-bold text-gray-900 transition-colors group-hover:text-yellow-600">
              {title}
            </h3>
          </Link>
        ) : (
          <h3 className="mb-2 text-xl font-bold text-gray-900">{title}</h3>
        )}

        {visibleFeatures.length > 0 ? (
          <ul className="mb-5 space-y-2 border-t border-gray-100 pt-4 text-sm">
            {visibleFeatures.map((feature, index) => (
              <li key={`${id}-feature-${index}`} className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-600" />
                <span className="line-clamp-1 text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mb-5 border-t border-gray-100 pt-4" />
        )}

        <div className="mt-auto border-t border-gray-100 pt-4">
          {priceLabel ? (
            <div className="mb-4">
              <div className="flex flex-wrap items-end gap-x-2 gap-y-1">
                <span className="text-2xl font-bold text-gray-900">
                  {priceLabel}
                </span>
                {originalPriceLabel ? (
                  <span className="text-sm text-gray-400 line-through">
                    {originalPriceLabel}
                  </span>
                ) : null}
              </div>
              {priceNote ? (
                <p className="mt-1 text-xs font-medium text-green-600">
                  {priceNote}
                </p>
              ) : null}
            </div>
          ) : null}

          {ctaHref ? (
            <Button
              asChild
              className="w-full rounded-xl font-semibold"
              variant={ctaVariant}
            >
              <Link href={ctaHref}>{ctaLabel}</Link>
            </Button>
          ) : (
            <Button
              className="w-full rounded-xl font-semibold"
              disabled={ctaDisabled}
              title={ctaTitle}
              variant={ctaVariant}
            >
              {ctaLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return CardBody;
}

export function ServiceCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-full animate-pulse flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm",
        className,
      )}
    >
      <div className="aspect-[4/3] w-full bg-gradient-to-br from-yellow-100 via-white to-orange-50" />

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 h-6 w-24 rounded-full bg-gray-200" />
        <div className="mb-2 h-7 w-3/4 rounded bg-gray-200" />

        <div className="mb-4 space-y-2">
          <div className="h-4 w-full rounded bg-gray-200" />
          <div className="h-4 w-full rounded bg-gray-200" />
          <div className="h-4 w-2/3 rounded bg-gray-200" />
        </div>

        <div className="mb-5 border-t border-gray-100 pt-4 space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-gray-200" />
              <div className="h-4 flex-1 rounded bg-gray-200" />
            </div>
          ))}
        </div>

        <div className="mt-auto border-t border-gray-100 pt-4">
          <div className="mb-4 space-y-2">
            <div className="h-7 w-32 rounded bg-gray-200" />
            <div className="h-4 w-40 rounded bg-gray-200" />
          </div>
          <div className="h-11 w-full rounded-xl bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
