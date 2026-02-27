import fs from "fs";
import path from "path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";

function getData() {
  const dataPath = path.join(process.cwd(), "data", "script-library.json");
  if (!fs.existsSync(dataPath)) return { sections: [], scripts: [] };
  return JSON.parse(fs.readFileSync(dataPath, "utf8"));
}

function shortDescription(intro: string | undefined, maxLength = 120): string {
  if (!intro || !intro.trim()) return "";
  const trimmed = intro.trim();
  const firstSentence = trimmed.split(/[.!?]+/)[0]?.trim() ?? trimmed;
  if (firstSentence.length <= maxLength) return firstSentence;
  return firstSentence.slice(0, maxLength).trim().replace(/\s+\S*$/, "") + "…";
}

export async function generateStaticParams() {
  const data = getData();
  return data.sections.map((s: { id: string }) => ({ sectionId: s.id }));
}

export default async function ScriptLibraryCategoryPage({
  params,
}: {
  params: Promise<{ sectionId: string }>;
}) {
  const { sectionId } = await params;
  const data = getData();
  const section = data.sections.find((s: { id: string }) => s.id === sectionId);
  if (!section) notFound();

  const scriptBySlug = new Map(
    data.scripts.map((s: { slug: string; title?: string; introduction?: string }) => [s.slug, s])
  );
  const scripts = section.scriptSlugs
    .map((slug: string) => scriptBySlug.get(slug))
    .filter(Boolean) as { slug: string; title: string; introduction?: string }[];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/script-library">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <p className="text-sm text-muted-foreground">Script library</p>
          <h1 className="font-serif text-2xl font-medium tracking-tight text-foreground">
            {section.name}
          </h1>
        </div>
      </div>

      {scripts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/40 bg-muted/20 px-6 py-12 text-center text-muted-foreground">
          No scripts in this category yet.
        </div>
      ) : (
        <ul className="space-y-3">
          {scripts.map((script) => (
            <li key={script.slug}>
              <Link
                href={`/dashboard/script-library/${script.slug}`}
                className="block rounded-lg border border-border/40 bg-card px-4 py-4 transition-colors hover:border-primary/30 hover:bg-primary/5"
              >
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 shrink-0 text-muted-foreground mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <h2 className="font-medium text-foreground">{script.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {shortDescription(script.introduction)}
                    </p>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="pt-2">
        <Link href="/dashboard/script-library">
          <Button variant="ghost" size="sm">Back to categories</Button>
        </Link>
      </div>
    </div>
  );
}
