"use client";

const STEPS = [
  { num: 1, label: "Choose script" },
  { num: 2, label: "Choose voice" },
  { num: 3, label: "Preview & mix" },
  { num: 4, label: "Save / Download" },
] as const;

type WizardProgressProps = {
  currentStep: number;
};

export function WizardProgress({ currentStep }: WizardProgressProps) {
  return (
    <nav aria-label="Progress" className="w-full">
      <ol className="flex items-center justify-between gap-2">
        {STEPS.map((step, index) => {
          const isComplete = currentStep > step.num;
          const isCurrent = currentStep === step.num;
          const stepIndex = index + 1;
          return (
            <li
              key={step.num}
              className="flex flex-1 flex-col items-center gap-1"
            >
              <div className="flex w-full items-center">
                {index > 0 && (
                  <div
                    className="h-0.5 flex-1"
                    aria-hidden
                    style={{
                      backgroundColor: isComplete ? "hsl(var(--primary))" : "hsl(var(--muted))",
                    }}
                  />
                )}
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                    isComplete
                      ? "bg-primary text-primary-foreground"
                      : isCurrent
                        ? "border-2 border-primary bg-background text-foreground"
                        : "border border-muted-foreground/30 bg-muted/50 text-muted-foreground"
                  }`}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isComplete ? "✓" : stepIndex}
                </span>
                {index < STEPS.length - 1 && (
                  <div
                    className="h-0.5 flex-1"
                    aria-hidden
                    style={{
                      backgroundColor: isComplete ? "hsl(var(--primary))" : "hsl(var(--muted))",
                    }}
                  />
                )}
              </div>
              <span
                className={`text-xs font-medium ${
                  isCurrent ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
