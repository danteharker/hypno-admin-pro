"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  FileText,
  Mic,
  Users,
  Presentation,
  LayoutDashboard,
  Library,
  ListChecks,
  Wrench,
  Rss,
  Sparkles,
  MessageCircle,
  SlidersHorizontal,
  Settings,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

type CommandItem = { label: string; href: string; icon: React.ComponentType<{ className?: string }> };

const PAGES: { heading: string; items: CommandItem[] }[] = [
  {
    heading: "Overview",
    items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    heading: "Content Studio",
    items: [
      { label: "Scripts", href: "/dashboard/scripts", icon: FileText },
      { label: "Script Library", href: "/dashboard/script-library", icon: Library },
      { label: "Suggestions", href: "/dashboard/suggestions", icon: ListChecks },
      { label: "Affirmations", href: "/dashboard/affirmations", icon: Sparkles },
      { label: "Tool Generator", href: "/dashboard/tool-generator", icon: Wrench },
    ],
  },
  {
    heading: "Audio & Media",
    items: [
      { label: "Audio", href: "/dashboard/audio", icon: Mic },
      { label: "Audio Studio", href: "/dashboard/audio/new", icon: SlidersHorizontal },
    ],
  },
  {
    heading: "Client Practice",
    items: [
      { label: "Clients", href: "/dashboard/clients", icon: Users },
      { label: "Session", href: "/dashboard/session", icon: Presentation },
      { label: "Reflection Room", href: "/dashboard/reflection-room", icon: MessageCircle },
    ],
  },
  {
    heading: "Marketing",
    items: [{ label: "Random Post Engine", href: "/dashboard/random-post-engine", icon: Rss }],
  },
  {
    heading: "Account",
    items: [{ label: "Settings", href: "/dashboard/settings", icon: Settings }],
  },
];

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 gap-0 max-w-2xl">
        <Command className="rounded-lg border-0 shadow-none" label="Navigate">
          <div className="flex items-center border-b px-3">
            <span className="mr-2 text-muted-foreground" aria-hidden>⌘K</span>
            <Command.Input
              placeholder="Search pages..."
              className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <Command.List className="max-h-[min(70vh,400px)] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>
            {PAGES.map((group) => (
              <Command.Group key={group.heading} heading={group.heading} className="mb-2">
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  {group.heading}
                </div>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Command.Item
                      key={item.href}
                      value={`${group.heading} ${item.label}`}
                      onSelect={() => {
                        router.push(item.href);
                        onOpenChange(false);
                      }}
                      className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground"
                    >
                      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                      {item.label}
                    </Command.Item>
                  );
                })}
              </Command.Group>
            ))}
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
