"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Upload, Library } from "lucide-react";
import { MAX_SCRIPT_LENGTH } from "./constants";

export type ScriptOption = { id: string; title: string; content: string };
export type LibraryScriptOption = {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
};

type Step1ChooseScriptProps = {
  scriptText: string;
  setScriptText: (value: string) => void;
  scripts: ScriptOption[];
  scriptsLoading: boolean;
  libraryScripts: LibraryScriptOption[];
  libraryLoading: boolean;
  error: string | null;
  onScriptSelect: (scriptId: string) => void;
  onLibraryScriptSelect: (script: LibraryScriptOption) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNext: () => void;
};

export function Step1ChooseScript({
  scriptText,
  setScriptText,
  scripts,
  scriptsLoading,
  libraryScripts,
  libraryLoading,
  error,
  onScriptSelect,
  onLibraryScriptSelect,
  onFileUpload,
  onNext,
}: Step1ChooseScriptProps) {
  const textLength = scriptText.length;
  const textTruncated = textLength > MAX_SCRIPT_LENGTH;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          Choose your script
        </CardTitle>
        <CardDescription>
          Pick from the site library, your saved scripts, upload a file, or type
          your own.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {libraryScripts.length > 0 && (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Library className="h-4 w-4" />
              Site Library
            </Label>
            <ScrollArea className="h-[140px] rounded-md border p-3">
              <div className="flex flex-wrap gap-2">
                {libraryScripts.map((lib) => (
                  <Button
                    key={lib.id}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-left justify-start h-auto py-2 px-3 whitespace-normal"
                    onClick={() => onLibraryScriptSelect(lib)}
                  >
                    {lib.title}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
        {libraryLoading && libraryScripts.length === 0 && (
          <p className="text-sm text-muted-foreground">Loading library…</p>
        )}
        <div className="space-y-2">
          <Label>My Scripts</Label>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select
              onValueChange={onScriptSelect}
              disabled={scriptsLoading}
            >
              <SelectTrigger className="w-full sm:w-[220px]">
                <SelectValue placeholder="Load from My Scripts…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">— Paste or type below —</SelectItem>
                {scripts.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <label className="flex items-center gap-2 px-3 py-2 rounded-md border border-input bg-background text-sm cursor-pointer hover:bg-accent/50">
              <Upload className="h-4 w-4" />
              Upload .txt
              <input
                type="file"
                accept=".txt"
                className="sr-only"
                onChange={onFileUpload}
              />
            </label>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Or type / paste your script</Label>
          <Textarea
            placeholder="Paste or type your script here…"
            value={scriptText}
            onChange={(e) => setScriptText(e.target.value)}
            className="min-h-[140px] resize-y"
            maxLength={MAX_SCRIPT_LENGTH + 500}
          />
          <p className="text-xs text-muted-foreground">
            {textTruncated
              ? `First ${MAX_SCRIPT_LENGTH} characters will be used.`
              : `${textLength} / ${MAX_SCRIPT_LENGTH} characters`}
          </p>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <Button onClick={onNext} disabled={!scriptText.trim()}>
          Next: Choose voice
        </Button>
      </CardFooter>
    </Card>
  );
}
