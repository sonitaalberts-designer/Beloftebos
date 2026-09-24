import type { ImgHTMLAttributes } from "react";
export function Photo({
  src,
  alt = "",
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  const local =
    typeof src === "string" &&
    /^\/images\/(property|farmhouse-hero|garden|pool|room|food|nature)\.avif$/.test(src);
  const path = local ? String(src).replace(".avif", "") : "";
  return (
    <img
      src={src}
      alt={alt}
      {...(local
        ? {
            srcSet: `${path}-720.webp 720w, ${path}-1280.webp 1280w, ${path}.avif 2400w`,
            sizes: "(max-width: 640px) 100vw, (max-width: 1000px) 75vw, 60vw",
            width: 2400,
            height: src === "/images/property.avif" ? 1600 : 1800,
          }
        : {})}
      {...props}
    />
  );
}
