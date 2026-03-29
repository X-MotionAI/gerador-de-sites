import { notFound } from "next/navigation";

interface ProjectPageProps {
  params: Promise<{ projectId: string }>;
}

const PIPELINE_STAGES = [
  { id: "briefing", label: "Briefing", icon: "1" },
  { id: "strategy", label: "Estrategia", icon: "2" },
  { id: "copy", label: "Copy", icon: "3" },
  { id: "design", label: "Design", icon: "4" },
  { id: "build", label: "Build", icon: "5" },
  { id: "qa", label: "Qualidade", icon: "6" },
  { id: "deploy", label: "Deploy", icon: "7" },
] as const;

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = await params;

  if (!projectId) {
    notFound();
  }

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">Projeto: {projectId}</h1>

      <div className="flex gap-2 mb-8">
        {PIPELINE_STAGES.map((stage) => (
          <div
            key={stage.id}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
            style={{ background: "var(--muted)" }}
          >
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                background: "var(--primary)",
                color: "var(--primary-foreground)",
              }}
            >
              {stage.icon}
            </span>
            {stage.label}
          </div>
        ))}
      </div>

      <div
        className="p-6 rounded-xl"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
      >
        <p style={{ color: "var(--muted-foreground)" }}>
          Selecione uma fase do pipeline para comecar.
        </p>
      </div>
    </main>
  );
}
