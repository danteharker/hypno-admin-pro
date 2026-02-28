"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const FOCUS_OPTIONS = [
  { id: "focus-anxiety", label: "Anxiety / Stress", value: "Anxiety" },
  { id: "focus-sleep", label: "Sleep Issues", value: "Sleep" },
  { id: "focus-habits", label: "Habit Cessation", value: "Habits" },
  { id: "focus-confidence", label: "Confidence", value: "Confidence" },
  { id: "focus-weight", label: "Weight Management", value: "Weight" },
  { id: "focus-phobias", label: "Phobias", value: "Phobias" },
];

export default function EditClientPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [archived, setArchived] = useState(false);
  const [focusChecked, setFocusChecked] = useState<Record<string, boolean>>({});
  const [focusOther, setFocusOther] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Please sign in.");
        setLoading(false);
        return;
      }
      const { data, error: fetchError } = await supabase
        .from("clients")
        .select("full_name, email, phone, notes, presenting_issues, archived")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();
      if (fetchError || !data) {
        setError(fetchError?.message ?? "Client not found.");
        setLoading(false);
        return;
      }
      const parts = (data.full_name ?? "").trim().split(/\s+/);
      setFirstName(parts[0] ?? "");
      setLastName(parts.slice(1).join(" ") ?? "");
      setEmail(data.email ?? "");
      setPhone(data.phone ?? "");
      setNotes(data.notes ?? "");
      setArchived(data.archived ?? false);
      const issues = (data.presenting_issues ?? "").split(/,\s*/).map((s: string) => s.trim());
      const otherMatch = issues.find((s: string) => s.startsWith("Other: "));
      setFocusOther(otherMatch ? otherMatch.slice(7) : "");
      const knownIssues = issues.filter((s: string) => !s.startsWith("Other: "));
      const next: Record<string, boolean> = {};
      FOCUS_OPTIONS.forEach((o) => {
        next[o.id] = knownIssues.includes(o.value);
      });
      setFocusChecked(next);
      setLoading(false);
    }
    load();
  }, [id]);

  const toggleFocus = (focusId: string) => {
    setFocusChecked((prev) => ({ ...prev, [focusId]: !prev[focusId] }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      const fullName = [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");
      if (!fullName) {
        setError("Please enter at least first or last name.");
        return;
      }
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Session expired. Please sign in again.");
        return;
      }
      const presentingIssues = [
        ...FOCUS_OPTIONS.filter((o) => focusChecked[o.id]).map((o) => o.value),
        focusOther.trim() ? `Other: ${focusOther.trim()}` : null,
      ]
        .filter(Boolean)
        .join(", ");
      const { error: updateError } = await supabase
        .from("clients")
        .update({
          full_name: fullName,
          email: email.trim() || null,
          phone: phone.trim() || null,
          notes: notes.trim() || null,
          presenting_issues: presentingIssues || null,
          archived,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", user.id);
      if (updateError) {
        setError(updateError.message);
        toast.error(updateError.message);
        return;
      }
      toast.success("Client updated");
      router.push(`/dashboard/clients/${id}`);
    } catch {
      setError("Something went wrong. Try again.");
      toast.error("Something went wrong. Try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { error: deleteError } = await supabase.from("clients").delete().eq("id", id).eq("user_id", user.id);
    if (deleteError) toast.error("Could not delete client");
    else toast.success("Client deleted");
    router.push("/dashboard/clients");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error && !firstName && !lastName) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-12 w-full">
        <Link href="/dashboard/clients">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 w-full">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/clients/${id}`}>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Edit Client</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Update profile and notes.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div className="space-y-6">
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-md">
              {error}
            </p>
          )}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Contact details and focus areas.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="Sarah"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Jenkins"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="sarah.j@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2 pt-2 border-t">
                <Label>Primary Focus Areas</Label>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  {FOCUS_OPTIONS.map((o) => (
                    <div key={o.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={o.id}
                        checked={focusChecked[o.id] ?? false}
                        onCheckedChange={() => toggleFocus(o.id)}
                      />
                      <label
                        htmlFor={o.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {o.label}
                      </label>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-2 pt-3">
                  <Label htmlFor="focus-other" className="text-sm font-medium">
                    Other
                  </Label>
                  <Input
                    id="focus-other"
                    placeholder="e.g. Smoking, Pain management..."
                    value={focusOther}
                    onChange={(e) => setFocusOther(e.target.value)}
                    className="max-w-md"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="archived"
                  checked={archived}
                  onCheckedChange={(c) => setArchived(c === true)}
                />
                <label
                  htmlFor="archived"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Archived (hide from active list)
                </label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Private Notes</CardTitle>
              <CardDescription>Practitioner-only notes.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Notes..."
                className="min-h-[150px] resize-none"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </CardContent>
            <CardFooter className="bg-muted/20 border-t px-6 py-4 flex justify-between">
              <Button
                type="button"
                variant="ghost"
                className="text-destructive"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Client
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save changes"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent showCloseButton={true}>
          <DialogHeader>
            <DialogTitle>Delete this client?</DialogTitle>
            <DialogDescription>
              This will permanently remove the client and their session history. This cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter showCloseButton={false}>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                handleDelete();
                setDeleteOpen(false);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
