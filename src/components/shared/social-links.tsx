"use client";

import { Facebook, Youtube, Instagram } from "lucide-react";
import { TikTokIcon } from "./tiktok-icon";

interface SocialLink {
  platform: string;
  url: string;
  icon: React.ElementType;
}

const platformIcons: Record<string, React.ElementType> = {
  facebook: Facebook,
  instagram: Instagram,
  tiktok: TikTokIcon,
  youtube: Youtube,
};

export function SocialLinks({
  links,
  className = "",
  iconClassName = "",
  hoverColor = "hover:bg-secondary hover:text-white",
  baseColor = "bg-white/10 text-white/80",
  size = "default",
}: {
  links: { facebook?: string; instagram?: string; tiktok?: string; youtube?: string };
  className?: string;
  iconClassName?: string;
  hoverColor?: string;
  baseColor?: string;
  size?: "default" | "lg";
}) {
  const socialLinks: SocialLink[] = Object.entries(links)
    .filter(([, url]) => url)
    .map(([platform, url]) => ({
      platform,
      url,
      icon: platformIcons[platform] || Facebook,
    }));

  if (socialLinks.length === 0) return null;

  const sizeClass = size === "lg" ? "w-10 h-10" : "w-9 h-9";
  const iconSize = size === "lg" ? "w-4 h-4" : "w-4 h-4";

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {socialLinks.map((link) => {
        const Icon = link.icon;
        return (
          <a
            key={link.platform}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${sizeClass} rounded-lg ${baseColor} flex items-center justify-center transition-colors ${hoverColor} ${iconClassName}`}
          >
            <Icon className={iconSize} />
          </a>
        );
      })}
    </div>
  );
}
