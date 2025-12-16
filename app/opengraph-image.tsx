import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Whiskerknots Logo";
export const size = {
  width: 600,
  height: 600,
};

export const contentType = "image/png";

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fffdf7", // --cozy-cream
        }}
      >
        {/* Soft Background Blobs */}
        <div
          style={{
            position: "absolute",
            width: "400px",
            height: "400px",
            borderRadius: "100%",
            background: "#ffdab9", // --warm-peach
            opacity: 0.2,
            filter: "blur(50px)",
          }}
        />

        {/* Main Logo Container */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "white",
            width: "450px",
            height: "450px",
            borderRadius: "120px", // Heavily rounded per design guide
            boxShadow: "0 20px 40px rgba(141, 110, 99, 0.15)",
            border: "8px solid #f4c2c2", // --soft-rose
            position: "relative",
          }}
        >
          {/* Icon Section */}
          <div
            style={{
              fontSize: 160,
              display: "flex",
              marginBottom: -10,
            }}
          >
            🧶
          </div>

          {/* Text Section */}
          <div
            style={{
              fontSize: 54,
              fontWeight: "bold",
              color: "#8d6e63", // --earthy-brown
              fontFamily: "sans-serif", // Comfortaa placeholder
              marginTop: 10,
            }}
          >
            Whiskerknots
          </div>

          {/* Subtext Badge */}
          <div
            style={{
              marginTop: 15,
              padding: "8px 24px",
              backgroundColor: "#f4c2c2", // --soft-rose
              borderRadius: "100px",
              color: "white",
              fontSize: 20,
              fontWeight: "bold",
              letterSpacing: "2px",
              textTransform: "uppercase",
            }}
          >
            Loops of Love
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
