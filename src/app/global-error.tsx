"use client";

// Last-resort boundary when the root layout itself fails. It replaces <html>,
// so it cannot rely on app fonts or components and uses inline styles only.
export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#fbf8f3",
          color: "#2b2326",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "1.5rem",
        }}
      >
        <main>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: "2rem", margin: 0 }}>
            Wedora is having a moment
          </h1>
          <p style={{ color: "#6f6360", marginTop: "0.75rem" }}>
            Something unexpected happened. Please try again.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              padding: "0.75rem 1.5rem",
              borderRadius: "999px",
              border: 0,
              background: "#6b2d3f",
              color: "#fbf8f3",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
