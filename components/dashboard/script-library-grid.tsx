"use client";

import Link from "next/link";
import { Library, ChevronRight } from "lucide-react";
import { AnimatedSection } from "@/components/motion/animated-section";
import { StaggerContainer, StaggerItem } from "@/components/motion/stagger-children";
import { PageHero } from "@/components/dashboard/page-hero";

type Section = { id: string; name: string };

export function ScriptLibraryContent({
  sections,
  emptyMessage,
}: {
  sections: Section[];
  emptyMessage: React.ReactNode;
}) {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <PageHero
        icon={Library}
        title="Script library"
        description="Choose a category to browse scripts."
        accentColor="teal"
        backHref="/dashboard"
      />

      {sections.length === 0 ? (
        <AnimatedSection delay={0.05}>
          <div className="rounded-2xl border border-border/40 bg-card/50 shadow-sm backdrop-blur-sm accent-bar accent-bar-teal overflow-hidden px-6 py-12 text-center text-muted-foreground">
            {emptyMessage}
          </div>
        </AnimatedSection>
      ) : (
        <AnimatedSection delay={0.05}>
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sections.map((section) => (
              <StaggerItem key={section.id}>
                <Link
                  href={`/dashboard/script-library/category/${section.id}`}
                  className="flex items-center gap-2 rounded-xl border border-accent-teal/20 bg-accent-teal/[0.06] px-4 py-3 text-left font-medium text-foreground transition-colors hover:border-accent-teal/40 hover:bg-accent-teal/10 hover:text-accent-teal hover-lift shadow-sm accent-bar accent-bar-teal overflow-hidden"
                >
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>{section.name}</span>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </AnimatedSection>
      )}
    </div>
  );
}
