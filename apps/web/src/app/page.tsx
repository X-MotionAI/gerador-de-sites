export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-2xl mx-auto px-6">
        <h1 className="text-4xl font-bold mb-4" style={{ color: "var(--primary)" }}>
          Gerador de Sites
        </h1>
        <p className="text-lg mb-8" style={{ color: "var(--muted-foreground)" }}>
          Framework de Agentes Inteligentes para criar landing pages, paginas de
          vendas e paginas de captura com o poder de 38 agentes especializados.
        </p>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="p-4 rounded-lg" style={{ background: "var(--muted)" }}>
            <div className="text-2xl font-bold" style={{ color: "var(--primary)" }}>38</div>
            <div>Agentes</div>
          </div>
          <div className="p-4 rounded-lg" style={{ background: "var(--muted)" }}>
            <div className="text-2xl font-bold" style={{ color: "var(--secondary)" }}>6</div>
            <div>Esquadroes</div>
          </div>
          <div className="p-4 rounded-lg" style={{ background: "var(--muted)" }}>
            <div className="text-2xl font-bold" style={{ color: "var(--accent)" }}>7</div>
            <div>Fases</div>
          </div>
        </div>
      </div>
    </main>
  );
}
