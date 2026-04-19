"use client";

import Link from "next/link";

export default function RestrictionsAdminPage() {
  return (
    <div style={{ padding: "40px", maxWidth: "600px", margin: "0 auto" }}>
      <Link href="/admin" style={{ color: "#0066cc" }}>
        ← Voltar
      </Link>

      <h1 style={{ marginTop: "20px" }}>🚫 Gerenciar Restrições</h1>
      <p style={{ color: "#666" }}>Em construção...</p>
    </div>
  );
}
