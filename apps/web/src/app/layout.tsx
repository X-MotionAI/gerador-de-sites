import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gerador de Sites - Framework de Agentes Inteligentes",
  description:
    "Gere landing pages, paginas de vendas e paginas de captura com um exercito de agentes especializados em copywriting, design, estrategia e conversao.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
