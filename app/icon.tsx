import { ImageResponse } from "next/og";

export const contentType = "image/png";

export function generateImageMetadata() {
  return [
    { id: "small", size: { width: 32, height: 32 }, contentType: "image/png" },
    { id: "medium", size: { width: 192, height: 192 }, contentType: "image/png" },
    { id: "large", size: { width: 512, height: 512 }, contentType: "image/png" },
  ];
}

function iconMarkup(size: number) {
  const radius = Math.round(size * 0.22);
  const fontSize = Math.round(size * 0.45);
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#4f46e5",
        color: "#ffffff",
        fontSize,
        fontWeight: 700,
        borderRadius: radius,
      }}
    >
      W
    </div>
  );
}

export default async function Icon({
  id,
}: {
  id: Promise<string>;
}) {
  const iconId = await id;
  const size =
    iconId === "large" ? 512 : iconId === "medium" ? 192 : 32;

  return new ImageResponse(iconMarkup(size), {
    width: size,
    height: size,
  });
}
