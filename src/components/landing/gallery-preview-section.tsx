"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Images } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/lib/app-context";
import { Skeleton } from "@/components/ui/skeleton";

export function GalleryPreviewSection() {
  const { galleryImages, settings, dataLoading } = useAppContext();
  const previewImages = galleryImages.slice(0, 6);
  const labels = settings.config.sectionLabels?.gallery;
  const btns = settings.config.buttonLabels || {} as Record<string, string>;

  return (
    <section className="py-20 md:py-28 bg-accent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label={labels?.label || "Gallery"}
          title={labels?.title || "Life at Special academy"}
          description={labels?.description || ""}
        />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {dataLoading
            ? Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className={`rounded-xl overflow-hidden ${
                    index === 0 ? "row-span-2 h-[400px] md:h-[500px]" : "h-48 md:h-56"
                  }`}
                >
                  <Skeleton className="w-full h-full rounded-xl" />
                </div>
              ))
            : previewImages.map((img, index) => (
                <motion.div
                  key={img.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, delay: index * 0.06 }}
                  className={`relative rounded-xl overflow-hidden group cursor-pointer ${
                    index === 0 ? "row-span-2" : ""
                  }`}
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    width={400}
                    height={index === 0 ? 500 : 250}
                    className={`w-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                      index === 0 ? "h-full min-h-[300px] md:min-h-[400px]" : "h-48 md:h-56"
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white text-sm font-medium">{img.alt}</p>
                    <p className="text-white/60 text-xs capitalize">{img.category}</p>
                  </div>
                </motion.div>
              ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <Button variant="outline" asChild>
            <Link href="/gallery">
              <Images className="w-4 h-4 mr-2" />
              {btns.viewFullGallery || "View Full Gallery"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
