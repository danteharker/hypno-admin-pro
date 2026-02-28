"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHero } from "@/components/dashboard/page-hero";
import { useSubscription } from "@/lib/subscription-context";
import { Settings, LogOut, Loader2, Mail, User, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { AnimatedSection } from "@/components/motion/animated-section";
import { toast } from "sonner";

export default function SettingsPage() {
  const router = useRouter();
  const { status, trialDaysRemaining } = useSubscription();
  const [email, setEmail] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [postEngineServices, setPostEngineServices] = useState<string>("");
  const [postEngineThemes, setPostEngineThemes] = useState<string>("");
  const [postEngineExpertise, setPostEngineExpertise] = useState<string>("");
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
        .select("full_name, post_engine_services, post_engine_themes, post_engine_expertise")
        .eq("id", user.id)
        .single();
      setFullName(profile?.full_name ?? "");
      setPostEngineServices(profile?.post_engine_services ?? "");
      setPostEngineThemes(profile?.post_engine_themes ?? "");
      setPostEngineExpertise(profile?.post_engine_expertise ?? "");
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
      .update({
        full_name: fullName.trim() || null,
        post_engine_services: postEngineServices.trim() || null,
        post_engine_themes: postEngineThemes.trim() || null,
        post_engine_expertise: postEngineExpertise.trim() || null,
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      setSaveMessage("Could not save. Try again.");
      toast.error("Could not save. Try again.");
      return;
    }
    setSaveMessage("Saved.");
    toast.success("Profile saved");
    setTimeout(() => setSaveMessage(null), 2000);
  };

  const handleManageBilling = async () => {
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (data?.url) window.location.href = data.url;
  };

  const handleResubscribe = async () => {
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await res.json();
    if (data?.url) window.location.href = data.url;
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

      <AnimatedSection delay={0.08}>
        <Card className="border-border/40 shadow-sm">
          <CardHeader>
            <CardTitle className="font-serif flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              Subscription
            </CardTitle>
            <CardDescription>
              {status === "trialing" && trialDaysRemaining != null && (
                <>Your trial ends in {trialDaysRemaining} day{trialDaysRemaining !== 1 ? "s" : ""}.</>
              )}
              {status === "active" && "Your subscription is active."}
              {(status === "expired" || status === "cancelled") && "Your subscription is inactive."}
              {status === "incomplete" && "Complete signup to start your 14-day free trial."}
              {status === "past_due" && "We couldn&apos;t process your payment. Update your card."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                status === "active" ? "bg-primary/15 text-primary" :
                status === "trialing" ? "bg-chart-2/20 text-chart-2" :
                status === "incomplete" ? "bg-amber-500/15 text-amber-600 dark:text-amber-400" :
                "bg-muted text-muted-foreground"
              }`}>
                {status === "trialing" ? "Trialing" : status === "active" ? "Active" : status === "past_due" ? "Past due" : status === "incomplete" ? "Incomplete" : "Inactive"}
              </span>
            </div>
            {(status === "trialing" || status === "active") && (
              <Button variant="outline" onClick={handleManageBilling} className="rounded-xl">
                <CreditCard className="h-4 w-4 mr-2" />
                Manage billing
              </Button>
            )}
            {(status === "expired" || status === "cancelled") && (
              <Button onClick={handleResubscribe} className="rounded-xl">
                Resubscribe for £8/month
              </Button>
            )}
            {status === "incomplete" && (
              <Button onClick={handleResubscribe} className="rounded-xl">
                Start free trial
              </Button>
            )}
            {status === "past_due" && (
              <Button onClick={handleManageBilling} className="rounded-xl">
                Update payment method
              </Button>
            )}
          </CardContent>
        </Card>
      </AnimatedSection>

      <AnimatedSection delay={0.1}>
        <Card className="border-border/40 shadow-sm">
          <CardHeader>
            <CardTitle className="font-serif">Post Engine defaults</CardTitle>
            <CardDescription>These pre-fill the Random Post Engine so you don&apos;t re-enter them each time.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="post-engine-services">Services offered</Label>
              <Textarea
                id="post-engine-services"
                value={postEngineServices}
                onChange={(e) => setPostEngineServices(e.target.value)}
                placeholder="e.g. Anxiety relief, smoking cessation, confidence building"
                className="min-h-[80px] resize-y"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="post-engine-themes">Themes / topics</Label>
              <Textarea
                id="post-engine-themes"
                value={postEngineThemes}
                onChange={(e) => setPostEngineThemes(e.target.value)}
                placeholder="e.g. Mind-body connection, subconscious change, relaxation"
                className="min-h-[80px] resize-y"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="post-engine-expertise">Areas of expertise</Label>
              <Textarea
                id="post-engine-expertise"
                value={postEngineExpertise}
                onChange={(e) => setPostEngineExpertise(e.target.value)}
                placeholder="e.g. Solution-focused hypnotherapy, NLP, 10+ years experience"
                className="min-h-[80px] resize-y"
              />
            </div>
            <Button onClick={handleSaveProfile} disabled={saving} className="rounded-xl">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save profile"
              )}
            </Button>
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
