import fs from "fs";
import path from "path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText } from "lucide-react";
import { ReimaginButton } from "@/components/dashboard/reimagine-button";

function getData() {
  const dataPath = path.join(process.cwd(), "data", "script-library.json");
  if (!fs.existsSync(dataPath)) return { sections: [], scripts: [] };
  return JSON.parse(fs.readFileSync(dataPath, "utf8"));
}

function sectionToId(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s*&\s*/g, " and ")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function wordCount(text: string): number {
  return (text || "").trim().split(/\s+/).filter(Boolean).length;
}

/** Approx reading time in minutes at ~130 words/min (spoken delivery). */
function readingMinutes(words: number): number {
  return Math.round(words / 130) || 0;
}

export async function generateStaticParams() {
  const data = getData();
  return data.scripts.map((s: { slug: string }) => ({ slug: s.slug }));
}

export default async function ScriptLibrarySlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = getData();
  const script = data.scripts.find((s: { slug: string }) => s.slug === slug);
  if (!script) notFound();

  const categoryId = sectionToId(script.section);
  const scriptWords = wordCount(script.content);
  const approxMin = readingMinutes(scriptWords);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/script-library/category/${categoryId}`}>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <p className="text-sm text-muted-foreground">{script.section}</p>
          <h1 className="font-serif text-2xl font-medium tracking-tight text-foreground">
            {script.title}
          </h1>
        </div>
      </div>

      <Card className="border-border/40 overflow-hidden">
        <CardHeader className="bg-muted/20 border-b border-border/40">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Introduction
            </CardTitle>
            <span className="text-sm text-muted-foreground font-normal">
              {scriptWords.toLocaleString()} words · ~{approxMin} min read
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {script.introduction}
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/40 overflow-hidden">
        <CardHeader className="bg-muted/20 border-b border-border/40">
          <CardTitle className="text-base font-medium">Script</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-headings:font-serif prose-headings:text-foreground text-foreground">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed bg-transparent p-0 border-0 rounded-none">
              {script.content}
            </pre>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <ReimaginButton
          content={script.content}
          title={script.title}
          section={script.section}
        />
        <Link href={`/dashboard/script-library/category/${categoryId}`}>
          <Button variant="outline">Back to {script.section}</Button>
        </Link>
      </div>
    </div>
  );
}
