"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";

interface ReimaginButtonProps {
  content: string;
  title: string;
  section: string;
}

export function ReimaginButton({ content, title, section }: ReimaginButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReimagine = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/scripts/reimagine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, title, section }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }
      router.push(`/dashboard/scripts/${data.id}`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handleReimagine}
        disabled={loading}
        className="rounded-full px-6 h-11 text-sm font-medium shadow-sm transition-all hover:shadow-md"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating your unique version...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 mr-2" />
            Reimagine with AI
          </>
        )}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
