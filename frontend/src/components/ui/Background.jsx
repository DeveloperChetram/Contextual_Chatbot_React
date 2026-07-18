import { MeshGradient } from "@paper-design/shaders-react";

export default function Background() {
  return (
    <MeshGradient
      colors={[
        "#0B1220",
        "#1E3A8A",
        "#22D3EE",
        "#14B8A6",
      ]}
      speed={0.25}
      className="w-full h-full absolute top-0 left-0 z-0"
    />
  );
}