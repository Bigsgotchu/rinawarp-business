import React from "react";

type BrandVariant = "terminal" | "aimvc" | "admin" | "main";

interface BrandLogoProps {
  variant?: BrandVariant;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = "main",
  className = "",
}) => {
  const getBrandInfo = (variant: BrandVariant) => {
    switch (variant) {
      case "terminal":
        return { text: "RinaWarp Terminal Pro", icon: "🖥️" };
      case "aimvc":
        return { text: "RinaWarp AI Music Video", icon: "🎵" };
      case "admin":
        return { text: "RinaWarp Admin Console", icon: "⚙️" };
      default:
        return { text: "RinaWarp Technologies", icon: "🚀" };
    }
  };

  const brandInfo = getBrandInfo(variant);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-xl" role="img" aria-label="RinaWarp">
        {brandInfo.icon}
      </span>
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-white">
          RinaWarp
        </span>
        <span className="text-xs text-neutral-400">
          {brandInfo.text.replace("RinaWarp ", "")}
        </span>
      </div>
    </div>
  );
};
