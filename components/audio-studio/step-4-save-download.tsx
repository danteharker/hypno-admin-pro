"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Download, Save, Loader2 } from "lucide-react";

type Step4SaveDownloadProps = {
  onDownloadVoice: () => void;
  onDownloadMix: () => void;
  onSaveOpen: () => void;
  hasMusic: boolean;
  exportingMix: boolean;
  onBackToPreview: () => void;
};

export function Step4SaveDownload({
  onDownloadVoice,
  onDownloadMix,
  onSaveOpen,
  hasMusic,
  exportingMix,
  onBackToPreview,
}: Step4SaveDownloadProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Save or download</CardTitle>
        <CardDescription>
          Download your voice track, the mixed MP3 (if you added music), or save
          to your Audio list.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <Button onClick={onDownloadVoice} variant="default">
            <Download className="h-4 w-4 mr-2" />
            Download voice track
          </Button>
          {hasMusic && (
            <Button onClick={onDownloadMix} disabled={exportingMix}>
              {exportingMix ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Download mixed MP3
            </Button>
          )}
          <Button variant="outline" onClick={onSaveOpen}>
            <Save className="h-4 w-4 mr-2" />
            Save to Audio list
          </Button>
        </div>
        <Button variant="ghost" onClick={onBackToPreview}>
          Back to preview
        </Button>
      </CardContent>
    </Card>
  );
}
