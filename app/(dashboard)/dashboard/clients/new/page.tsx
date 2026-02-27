"use client";

import { useState } from "react";
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
import { ArrowLeft, UserPlus, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const FOCUS_OPTIONS = [
  { id: "focus-anxiety", label: "Anxiety / Stress", value: "Anxiety" },
  { id: "focus-sleep", label: "Sleep Issues", value: "Sleep" },
  { id: "focus-habits", label: "Habit Cessation", value: "Habits" },
  { id: "focus-confidence", label: "Confidence", value: "Confidence" },
  { id: "focus-weight", label: "Weight Management", value: "Weight" },
  { id: "focus-phobias", label: "Phobias", value: "Phobias" },
];

export default function NewClientPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [focusChecked, setFocusChecked] = useState<Record<string, boolean>>({});
  const [focusOther, setFocusOther] = useState("");

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
      const { data: client, error: insertError } = await supabase
        .from("clients")
        .insert({
          user_id: user.id,
          full_name: fullName,
          email: email.trim() || null,
          phone: phone.trim() || null,
          notes: notes.trim() || null,
          presenting_issues: presentingIssues || null,
        })
        .select("id")
        .single();
      if (insertError) {
        setError(insertError.message);
        return;
      }
      router.push(`/dashboard/clients/${client.id}`);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleFocus = (id: string) => {
    setFocusChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 w-full">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/clients">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">New Client</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create a new client profile.
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
              <CardDescription>Contact details and client intake info.</CardDescription>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Intake Notes</CardTitle>
              <CardDescription>Initial observations and private notes.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter any initial notes from the consultation call or intake form..."
                className="min-h-[150px] resize-none"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </CardContent>
            <CardFooter className="bg-muted/20 border-t px-6 py-4 flex justify-between">
              <Button
                variant="ghost"
                type="button"
                onClick={() => router.push("/dashboard/clients")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create Profile
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  );
}
