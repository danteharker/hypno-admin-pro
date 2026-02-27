"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sparkles,
  FileText,
  ArrowLeft,
  Loader2,
  ListChecks,
  ChevronDown,
  ArrowDown,
  Expand,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PageHero } from "@/components/dashboard/page-hero";
import { AnimatedSection } from "@/components/motion/animated-section";
import type {
  ScriptCategory,
  InductionKey,
  DeepenerKey,
  TherapeuticApproachKey,
  ClientPronounKey,
  ScriptSectionKey,
} from "@/lib/prompts/script-generation";
import { SECTION_LABELS, SECTION_TITLES } from "@/lib/prompts/script-generation";
import {
  countWords,
  formatWordCountAndTime,
  getHypnoticReadingTimeMinutes,
} from "@/lib/script-utils";

const TEXTAREA_MAX_LENGTH = 500;
const SCRIPT_SECTIONS: ScriptSectionKey[] = [
  "induction",
  "deepener",
  "intervention",
  "postHypnoticSuggestions",
  "awakening",
];

const METAPHOR_OPTIONS = [
  { id: "ocean", label: "Ocean / water" },
  { id: "nature", label: "Nature / gardens / forest" },
  { id: "visual", label: "Visual imagery (sight)" },
  { id: "auditory", label: "Auditory / sound" },
  { id: "kinesthetic", label: "Kinesthetic / feeling" },
  { id: "countdowns", label: "Countdowns" },
  { id: "staircase", label: "Staircase / steps" },
  { id: "safe_place", label: "Safe place / sanctuary" },
  { id: "journey", label: "Journey / path" },
  { id: "light_warmth", label: "Light / warmth" },
];

const initialSectionTexts: Record<ScriptSectionKey, string> = {
  induction: "",
  deepener: "",
  intervention: "",
  postHypnoticSuggestions: "",
  awakening: "",
};

export default function NewScriptPage() {
  const router = useRouter();
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [category, setCategory] = useState<ScriptCategory>("relaxation");
  const [categoryOther, setCategoryOther] = useState("");
  const [clientProfile, setClientProfile] = useState("");
  const [inductionStyle, setInductionStyle] = useState<InductionKey>("progressive");
  const [deepenerStyle, setDeepenerStyle] = useState<DeepenerKey | "">("");
  const [therapeuticApproach, setTherapeuticApproach] =
    useState<TherapeuticApproachKey | "">("");
  const [clientPronoun, setClientPronoun] = useState<ClientPronounKey>("none");
  const [blankTitle, setBlankTitle] = useState("");

  const [metaphorSelections, setMetaphorSelections] = useState<string[]>([]);
  const [metaphorOther, setMetaphorOther] = useState("");

  const [sectionTexts, setSectionTexts] =
    useState<Record<ScriptSectionKey, string>>(initialSectionTexts);
  const [sectionsToGenerate, setSectionsToGenerate] = useState<
    ScriptSectionKey[]
  >([]);
  const [loadingSection, setLoadingSection] = useState<ScriptSectionKey | null>(
    null
  );
  const [lengthenSection, setLengthenSection] =
    useState<ScriptSectionKey | null>(null);
  const [savingCombine, setSavingCombine] = useState(false);

  const setSectionText = (section: ScriptSectionKey, value: string) => {
    setSectionTexts((prev) => ({ ...prev, [section]: value }));
  };

  const getSectionPayload = () => {
    const selectedLabels = metaphorSelections
      .map((id) => METAPHOR_OPTIONS.find((o) => o.id === id)?.label)
      .filter(Boolean) as string[];
    const metaphorsStr = [
      ...selectedLabels,
      metaphorOther.trim() || undefined,
    ]
      .filter(Boolean)
      .join("; ");
    return {
      category,
      customCategory: category === "custom" ? categoryOther.trim() : undefined,
      clientProfile,
      metaphors: metaphorsStr || undefined,
      inductionStyle,
      deepenerStyle: deepenerStyle || undefined,
      therapeuticApproach: therapeuticApproach || undefined,
      clientPronoun: clientPronoun !== "none" ? clientPronoun : undefined,
    };
  };

  const emptySelectedSections = sectionsToGenerate.filter(
    (s) => !sectionTexts[s]?.trim()
  );
  const filledSelectedCount = sectionsToGenerate.length - emptySelectedSections.length;

  const handleGenerateSelected = async () => {
    if (sectionsToGenerate.length === 0) return;
    const toGenerate = sectionsToGenerate.filter(
      (s) => !sectionTexts[s]?.trim()
    );
    if (toGenerate.length === 0) {
      setGenerateError(
        "Selected sections already have content. Add more sections above, or clear one to regenerate it."
      );
      return;
    }
    setGenerateError(null);
    for (const section of toGenerate) {
      setLoadingSection(section);
      try {
        const res = await fetch("/api/scripts/generate/section", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "generate",
            section,
            ...getSectionPayload(),
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setGenerateError(data.error || "Generation failed");
          setLoadingSection(null);
          return;
        }
        setSectionText(section, data.content ?? "");
      } catch {
        setGenerateError("Something went wrong. Try again.");
        setLoadingSection(null);
        return;
      }
    }
    setLoadingSection(null);
  };

  const allSectionsSelected =
    sectionsToGenerate.length === SCRIPT_SECTIONS.length;
  const toggleSectionForGenerate = (section: ScriptSectionKey) => {
    setSectionsToGenerate((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };
  const setAllSectionsForGenerate = (checked: boolean) => {
    setSectionsToGenerate(checked ? [...SCRIPT_SECTIONS] : []);
  };

  const handleLengthenSection = async (section: ScriptSectionKey) => {
    const current = sectionTexts[section]?.trim();
    if (!current) {
      setGenerateError(`Add or generate content in ${SECTION_TITLES[section]} first.`);
      return;
    }
    setGenerateError(null);
    setLengthenSection(section);
    try {
      const res = await fetch("/api/scripts/generate/section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "lengthen",
          section,
          existingText: current,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setGenerateError(data.error || "Lengthen failed");
        return;
      }
      setSectionText(section, data.content ?? current);
    } catch {
      setGenerateError("Something went wrong. Try again.");
    } finally {
      setLengthenSection(null);
    }
  };

  const handleCombineAndSave = async () => {
    const parts: string[] = [];
    for (const key of SCRIPT_SECTIONS) {
      const text = sectionTexts[key]?.trim();
      if (text) {
        parts.push(`[${SECTION_LABELS[key]}]\n\n${text}`);
      }
    }
    const combinedContent = parts.join("\n\n");
    if (!combinedContent.trim()) {
      setGenerateError("Add or generate at least one section before saving.");
      return;
    }
    setGenerateError(null);
    setSavingCombine(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setGenerateError("Session expired. Please sign in again.");
        return;
      }
      const categoryLabel =
        category === "custom" && categoryOther.trim()
          ? categoryOther.trim()
          : category.charAt(0).toUpperCase() + category.slice(1);
      const { data: script, error } = await supabase
        .from("scripts")
        .insert({
          user_id: user.id,
          title: `Generated: ${categoryLabel}`,
          content: combinedContent,
          category,
        })
        .select("id")
        .single();
      if (error) {
        setGenerateError(error.message);
        return;
      }
      router.push(`/dashboard/scripts/${script.id}`);
    } catch {
      setGenerateError("Something went wrong. Try again.");
    } finally {
      setSavingCombine(false);
    }
  };

  const handleBlank = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    const { data: script, error } = await supabase
      .from("scripts")
      .insert({
        user_id: user.id,
        title: blankTitle.trim() || "Untitled Script",
        content: "",
      })
      .select("id")
      .single();
    if (error) {
      setGenerateError(error.message);
      return;
    }
    router.push(`/dashboard/scripts/${script.id}`);
  };

  const canGenerate = !!(
    category &&
    clientProfile.trim() &&
    inductionStyle &&
    (category !== "custom" || categoryOther.trim())
  );

  const totalWords = SCRIPT_SECTIONS.reduce(
    (sum, key) => sum + countWords(sectionTexts[key] ?? ""),
    0
  );
  const totalMinutes = getHypnoticReadingTimeMinutes(
    SCRIPT_SECTIONS.map((k) => sectionTexts[k] ?? "").join(" ")
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 w-full">
      <PageHero
        icon={Sparkles}
        title="Create Script"
        description="Build your script section by section with AI, or start from a blank canvas."
        accentColor="emerald"
        backHref="/dashboard/scripts"
      />

      <AnimatedSection delay={0.05}>
      <Tabs defaultValue="ai" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Interactive Workspace
          </TabsTrigger>
          <TabsTrigger value="blank" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Blank Canvas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="space-y-6">
          {/* ——— Setup Section ——— */}
          <Card className="accent-bar accent-bar-emerald overflow-hidden bg-primary/[0.04] border-primary/20 hover-lift shadow-sm gradient-border">
            <CardHeader>
              <CardTitle className="font-serif">Setup</CardTitle>
              <CardDescription>
                Set your client profile, category, and preferences. These are
                used when generating each section below.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {generateError && (
                <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {generateError}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Fields marked with{" "}
                <span className="text-foreground font-medium">*</span> are
                required for AI generation.
              </p>
              <div className="space-y-2">
                <Label htmlFor="category">
                  Primary Category{" "}
                  <span className="text-destructive" aria-hidden>*</span>
                </Label>
                <Select
                  value={category}
                  onValueChange={(v) => setCategory(v as ScriptCategory)}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relaxation">Deep Relaxation</SelectItem>
                    <SelectItem value="anxiety">Anxiety & Stress</SelectItem>
                    <SelectItem value="sleep">Sleep Induction</SelectItem>
                    <SelectItem value="confidence">
                      Confidence & Self-Esteem
                    </SelectItem>
                    <SelectItem value="habits">
                      Habit Control (e.g., Smoking)
                    </SelectItem>
                    <SelectItem value="weight">Weight Management</SelectItem>
                    <SelectItem value="phobias">Fears & Phobias</SelectItem>
                    <SelectItem value="custom">Other</SelectItem>
                  </SelectContent>
                </Select>
                {category === "custom" && (
                  <Input
                    placeholder="Please specify the category..."
                    value={categoryOther}
                    onChange={(e) => setCategoryOther(e.target.value)}
                    className="mt-2"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientProfile">
                  Client Profile & Presenting Issue{" "}
                  <span className="text-destructive" aria-hidden>*</span>
                </Label>
                <div className="relative">
                  <Textarea
                    id="clientProfile"
                    placeholder="Briefly describe the client, their primary issue, and what triggers their symptoms..."
                    className="h-24 resize-none pr-16"
                    maxLength={TEXTAREA_MAX_LENGTH}
                    value={clientProfile}
                    onChange={(e) => setClientProfile(e.target.value)}
                  />
                  <span className="absolute bottom-2 right-3 text-xs text-muted-foreground tabular-nums">
                    {clientProfile.length} / {TEXTAREA_MAX_LENGTH}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Include client age, specific triggers, and desired outcome for
                  the most accurate script.
                </p>
              </div>

              <div className="space-y-2">
                <Label>
                  Preferred Metaphors / Language{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-md border p-4">
                  {METAPHOR_OPTIONS.map((opt) => (
                    <label
                      key={opt.id}
                      className="flex items-center gap-3 cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      <Checkbox
                        checked={metaphorSelections.includes(opt.id)}
                        onCheckedChange={(checked) => {
                          setMetaphorSelections((prev) =>
                            checked
                              ? [...prev, opt.id]
                              : prev.filter((id) => id !== opt.id)
                          );
                        }}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
                <div className="space-y-2 pt-1">
                  <label className="flex items-center gap-3 cursor-pointer text-sm font-medium">
                    <Checkbox
                      checked={metaphorSelections.includes("other")}
                      onCheckedChange={(checked) => {
                        setMetaphorSelections((prev) =>
                          checked
                            ? [...prev, "other"]
                            : prev.filter((id) => id !== "other")
                        );
                      }}
                    />
                    Other
                  </label>
                  {metaphorSelections.includes("other") && (
                    <Input
                      placeholder="Describe your own metaphors or preferences..."
                      value={metaphorOther}
                      onChange={(e) => setMetaphorOther(e.target.value)}
                      className="max-w-md"
                    />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Add any specific metaphors, trigger words, or preferred
                  sensory modalities (VAK).
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">
                  Client Gender{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </Label>
                <Select
                  value={clientPronoun}
                  onValueChange={(v) =>
                    setClientPronoun(v as ClientPronounKey)
                  }
                >
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Choose for script language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      Not relevant to this script
                    </SelectItem>
                    <SelectItem value="she">Female (She/Her)</SelectItem>
                    <SelectItem value="he">Male (He/Him)</SelectItem>
                    <SelectItem value="they">Non-binary (They/Them)</SelectItem>
                    <SelectItem value="other">
                      Other / Prefer to self-describe
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  The script will use the appropriate pronouns when referring to
                  the client. For relaxation and many scripts, &quot;Not relevant&quot; is ideal.
                </p>
              </div>

              <Collapsible defaultOpen={false} className="rounded-md border">
                <CollapsibleTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full justify-between px-4 py-3 h-auto font-medium"
                  >
                    Advanced Options
                    <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-4 border-t px-4 pb-4 pt-3">
                    <div className="space-y-2">
                      <Label htmlFor="induction">
                        Induction Style{" "}
                        <span className="text-destructive" aria-hidden>*</span>
                      </Label>
                      <Select
                        value={inductionStyle}
                        onValueChange={(v) =>
                          setInductionStyle(v as InductionKey)
                        }
                      >
                        <SelectTrigger id="induction">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="progressive">
                            Progressive Muscle Relaxation
                          </SelectItem>
                          <SelectItem value="breathing">Breath Focus</SelectItem>
                          <SelectItem value="staircase">
                            Staircase / Deepening
                          </SelectItem>
                          <SelectItem value="confusion">
                            Confusion Technique
                          </SelectItem>
                          <SelectItem value="direct">
                            Direct Suggestion
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deepener">
                        Deepener Style{" "}
                        <span className="font-normal text-muted-foreground">
                          (optional)
                        </span>
                      </Label>
                      <Select
                        value={deepenerStyle === "" ? undefined : deepenerStyle}
                        onValueChange={(v) =>
                          setDeepenerStyle((v ?? "") as DeepenerKey | "")
                        }
                      >
                        <SelectTrigger id="deepener">
                          <SelectValue placeholder="Select deepener (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="staircase">
                            The Staircase
                          </SelectItem>
                          <SelectItem value="lift">The Lift/Elevator</SelectItem>
                          <SelectItem value="countdown">
                            10-to-1 Countdown
                          </SelectItem>
                          <SelectItem value="nature_walk">
                            Nature Walk
                          </SelectItem>
                          <SelectItem value="fractional">
                            Fractional Relaxation
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="therapeutic">
                        Therapeutic Approach{" "}
                        <span className="font-normal text-muted-foreground">
                          (optional)
                        </span>
                      </Label>
                      <Select
                        value={
                          therapeuticApproach === ""
                            ? undefined
                            : therapeuticApproach
                        }
                        onValueChange={(v) =>
                          setTherapeuticApproach(
                            (v ?? "") as TherapeuticApproachKey | ""
                          )
                        }
                      >
                        <SelectTrigger id="therapeutic">
                          <SelectValue placeholder="Select approach (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="direct_suggestion">
                            Direct Suggestion
                          </SelectItem>
                          <SelectItem value="metaphorical_journey">
                            Metaphorical Journey
                          </SelectItem>
                          <SelectItem value="parts_integration">
                            Parts Integration
                          </SelectItem>
                          <SelectItem value="inner_child">
                            Inner Child Work
                          </SelectItem>
                          <SelectItem value="rewind_nlp">
                            Rewind Technique / NLP
                          </SelectItem>
                          <SelectItem value="cbt_focused">
                            CBT-Focused
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>

          {/* ——— Modular Workspace: 5 sections ——— */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold font-serif">
              Modular Workspace
            </h2>
            <p className="text-sm text-muted-foreground">
              Choose which sections to create, then generate. Use Lengthen on
              any section to expand existing content.
            </p>

            <div className="rounded-md border p-4 space-y-3">
              <Label className="text-base font-medium">
                What do you want to create?
              </Label>
              <div className="flex flex-col gap-3">
                {SCRIPT_SECTIONS.map((sectionKey) => (
                  <label
                    key={sectionKey}
                    className="flex items-center gap-3 cursor-pointer text-sm font-medium"
                  >
                    <Checkbox
                      checked={sectionsToGenerate.includes(sectionKey)}
                      onCheckedChange={() =>
                        toggleSectionForGenerate(sectionKey)
                      }
                    />
                    {SECTION_TITLES[sectionKey]}
                  </label>
                ))}
                <label className="flex items-center gap-3 cursor-pointer text-sm font-medium">
                  <Checkbox
                    checked={allSectionsSelected}
                    onCheckedChange={(checked) =>
                      setAllSectionsForGenerate(!!checked)
                    }
                  />
                  All
                </label>
              </div>
              <Button
                type="button"
                disabled={
                  !canGenerate ||
                  sectionsToGenerate.length === 0 ||
                  emptySelectedSections.length === 0 ||
                  loadingSection !== null
                }
                onClick={handleGenerateSelected}
                className="mt-2"
              >
                {loadingSection ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating {SECTION_TITLES[loadingSection]}...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate {emptySelectedSections.length} section
                    {emptySelectedSections.length !== 1 ? "s" : ""}
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground mt-1.5">
                Only empty sections are generated. Check more boxes anytime to add
                more sections without overwriting what you have.
                {filledSelectedCount > 0 &&
                  ` (${filledSelectedCount} selected already have content.)`}
              </p>
            </div>

            {SCRIPT_SECTIONS.map((sectionKey, idx) => (
              <Card
                key={sectionKey}
                className={`accent-bar overflow-hidden shadow-sm hover-lift ${idx % 2 === 0 ? "accent-bar-emerald bg-primary/[0.04] border-primary/20" : "accent-bar-teal bg-accent-teal/[0.04] border-accent-teal/20"}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base font-serif">
                        {SECTION_TITLES[sectionKey]}
                      </CardTitle>
                      <CardDescription>
                        {sectionKey === "induction" &&
                          "Bring the client into trance using the chosen induction style."}
                        {sectionKey === "deepener" &&
                          "Deepen the trance with imagery or countdown."}
                        {sectionKey === "intervention" &&
                          "Core therapeutic work for the presenting issue."}
                        {sectionKey === "postHypnoticSuggestions" &&
                          "Suggestions that carry over after the session."}
                        {sectionKey === "awakening" &&
                          "Safe, gradual return to full awareness."}
                      </CardDescription>
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                      {formatWordCountAndTime(sectionTexts[sectionKey] ?? "")}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Textarea
                    placeholder={`Write or generate the ${SECTION_TITLES[sectionKey].toLowerCase()} section...`}
                    className="min-h-[140px] resize-y font-mono text-sm"
                    value={sectionTexts[sectionKey]}
                    onChange={(e) =>
                      setSectionText(sectionKey, e.target.value)
                    }
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      disabled={
                        !sectionTexts[sectionKey]?.trim() ||
                        lengthenSection !== null
                      }
                      onClick={() => handleLengthenSection(sectionKey)}
                    >
                      {lengthenSection === sectionKey ? (
                        <>
                          <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                          Expanding...
                        </>
                      ) : (
                        <>
                          <Expand className="mr-2 h-3.5 w-3.5" />
                          Lengthen
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* ——— Combine & Save ——— */}
          <Card className="card-gradient-emerald bg-transparent text-white border-0 overflow-hidden shadow-lg hover-lift">
            <CardContent className="pt-6 relative">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/4 -right-1/4 w-48 h-48 rounded-full bg-white/10 blur-[50px]" />
              </div>
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="font-medium font-serif text-white">Combine & Save Script</p>
                  <p className="text-sm text-white/75 mt-1">
                    Saves all sections as one script and opens the editor.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <p className="text-sm text-white/80 tabular-nums">
                    <span className="font-medium text-white">
                      {totalWords.toLocaleString()} words
                    </span>
                    {" • "}
                    <span className="font-medium text-white">
                      ~{totalMinutes} min{totalMinutes !== 1 ? "s" : ""}
                    </span>
                  </p>
                  <Button
                    size="lg"
                    className="shrink-0 bg-white text-primary hover:bg-white/90 btn-shimmer"
                    disabled={savingCombine}
                    onClick={handleCombineAndSave}
                  >
                    {savingCombine ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <ArrowDown className="mr-2 h-4 w-4" />
                        Combine & Save Script
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blank">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Start from Scratch</CardTitle>
              <CardDescription>
                Open an empty editor to write your own script, or paste an
                existing one.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {generateError && (
                <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {generateError}
                </p>
              )}
              <div className="space-y-2">
                <Label htmlFor="blank-title">
                  Script Title{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="blank-title"
                  placeholder="E.g., Morning Confidence Routine"
                  value={blankTitle}
                  onChange={(e) => setBlankTitle(e.target.value)}
                />
              </div>

              <div className="rounded-md bg-muted/50 p-6 flex flex-col items-center justify-center text-center">
                <ListChecks className="h-8 w-8 text-muted-foreground mb-4" />
                <h3 className="font-medium">The Editor</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                  The Hypno Admin Pro editor includes specialized formatting for
                  inductions, deepeners, and suggestions, plus a built-in timer.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t bg-muted/20 px-6 py-4">
              <Button
                variant="ghost"
                type="button"
                onClick={() => router.push("/dashboard/scripts")}
              >
                Cancel
              </Button>
              <Button type="button" onClick={handleBlank}>
                <FileText className="mr-2 h-4 w-4" />
                Create Blank Script
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      </AnimatedSection>
    </div>
  );
}
