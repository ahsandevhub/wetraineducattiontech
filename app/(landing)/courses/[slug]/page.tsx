"use client";

import { createClient } from "@/app/utils/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use, useEffect, useState } from "react";

interface Service {
  id: string;
  title: string;
  slug: string;
  category: "course" | "software" | "marketing";
  price: number | null;
  discount: number | null;
  currency: string;
  details: string | null;
  key_features: string[];
  featured_image_url: string;
}

export default function CourseDetailPage({
  params: paramsPromise,
}: {
  params: Promise<{ slug: string }>;
}) {
  const params = use(paramsPromise);
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundFlag, setNotFoundFlag] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const loadService = async () => {
      try {
        const { data, error } = await supabase
          .from("services")
          .select("*")
          .eq("slug", params.slug)
          .eq("category", "course")
          .single();

        if (error || !data) {
          setNotFoundFlag(true);
          return;
        }

        setService(data);
      } catch (error) {
        console.error("Error loading service:", error);
        setNotFoundFlag(true);
      } finally {
        setLoading(false);
      }
    };

    loadService();
  }, [params.slug, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (notFoundFlag || !service) {
    notFound();
  }

  const finalPrice =
    service.discount && service.discount > 0
      ? service.price! - service.discount
      : service.price;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Courses
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Hero Image */}
            <div className="relative h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden mb-8">
              {service.featured_image_url ? (
                <Image
                  src={service.featured_image_url}
                  alt={service.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl">
                  📚
                </div>
              )}
            </div>

            {/* Title & Badge */}
            <div className="mb-6">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-gray-900 mb-3">
                    {service.title}
                  </h1>
                  <Badge
                    variant="outline"
                    className="text-blue-600 border-blue-300"
                  >
                    Training Course
                  </Badge>
                </div>
              </div>
            </div>

            {/* Description */}
            {service.details && (
              <Card className="mb-8 border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl">About This Course</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {service.details}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Key Features */}
            {service.key_features && service.key_features.length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl">
                    What You&apos;ll Learn
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {service.key_features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Pricing & CTA */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 shadow-lg">
              <CardContent className="p-6">
                {/* Pricing */}
                {service.price !== null && (
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-2">Price</p>
                    <div className="flex items-baseline gap-3">
                      {service.discount && service.discount > 0 && (
                        <span className="text-3xl font-bold text-gray-900">
                          ৳{finalPrice!.toFixed(0)}
                        </span>
                      )}
                      <span
                        className={
                          service.discount && service.discount > 0
                            ? "text-lg text-gray-500 line-through"
                            : "text-3xl font-bold text-gray-900"
                        }
                      >
                        ৳{service.price.toFixed(0)}
                      </span>
                    </div>
                    {service.discount && service.discount > 0 && (
                      <p className="text-sm text-green-600 font-semibold mt-2">
                        Save ৳{service.discount.toFixed(0)}
                      </p>
                    )}
                  </div>
                )}

                {/* CTA Buttons */}
                <div className="space-y-3">
                  <Link
                    href={`/checkout?service=${service.id}`}
                    className="block"
                  >
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      Enroll Now
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full">
                    <a href="#proposal" className="w-full">
                      Request Custom Training
                    </a>
                  </Button>
                </div>

                {/* Course Info */}
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
                  <div>
                    <p className="text-xs text-gray-600 uppercase font-semibold">
                      Category
                    </p>
                    <p className="text-sm text-gray-900 mt-1">
                      Training Course
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
