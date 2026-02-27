"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHero } from "@/components/dashboard/page-hero";
import { Settings, LogOut, Loader2, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { createClient } from "@/lib/supabase/client";
import { AnimatedSection } from "@/components/motion/animated-section";

export default function SettingsPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setEmail(user.email ?? "");
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      setFullName(profile?.full_name ?? "");
      setLoading(false);
    })();
  }, []);

  const handleSaveProfile = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    setSaving(true);
    setSaveMessage(null);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName.trim() || null })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      setSaveMessage("Could not save. Try again.");
      return;
    }
    setSaveMessage("Saved.");
    setTimeout(() => setSaveMessage(null), 2000);
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto w-full flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto w-full space-y-8">
      <PageHero
        icon={Settings}
        title="Settings"
        description="Account and preferences. Configure your workspace here."
        accentColor="emerald"
      />

      <AnimatedSection delay={0.05}>
        <Card className="border-border/40 shadow-sm">
          <CardHeader>
            <CardTitle className="font-serif flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              Profile
            </CardTitle>
            <CardDescription>Your display name and email.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="display-name">Display name</Label>
              <Input
                id="display-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
                className="max-w-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="max-w-sm bg-muted/50 cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">Email is set by your account and cannot be changed here.</p>
            </div>
            {saveMessage && (
              <p className={`text-sm ${saveMessage === "Saved." ? "text-primary" : "text-destructive"}`}>
                {saveMessage}
              </p>
            )}
            <Button onClick={handleSaveProfile} disabled={saving} className="rounded-xl">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save name"
              )}
            </Button>
          </CardContent>
        </Card>
      </AnimatedSection>

      <AnimatedSection delay={0.1}>
        <Card className="border-border/40 shadow-sm">
          <CardHeader>
            <CardTitle className="font-serif">Appearance</CardTitle>
            <CardDescription>Choose light, dark, or system theme.</CardDescription>
          </CardHeader>
          <CardContent>
            <ThemeToggle />
          </CardContent>
        </Card>
      </AnimatedSection>

      <AnimatedSection delay={0.15}>
        <Card className="border-border/40 shadow-sm border-destructive/20">
          <CardHeader>
            <CardTitle className="font-serif flex items-center gap-2 text-destructive">
              <LogOut className="h-5 w-5" />
              Sign out
            </CardTitle>
            <CardDescription>Sign out of this account on this device.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={handleSignOut} className="rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </CardContent>
        </Card>
      </AnimatedSection>
    </div>
  );
}
