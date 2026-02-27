import fs from "fs";
import path from "path";
import { ScriptLibraryContent } from "@/components/dashboard/script-library-grid";

function getData() {
  const dataPath = path.join(process.cwd(), "data", "script-library.json");
  if (!fs.existsSync(dataPath)) return { sections: [], scripts: [] };
  return JSON.parse(fs.readFileSync(dataPath, "utf8"));
}

export default function ScriptLibraryMenuPage() {
  const data = getData();
  const { sections } = data;

  return (
    <ScriptLibraryContent
      sections={sections}
      emptyMessage={
        <p>
          No categories yet. Run <code className="text-xs bg-muted px-1 rounded">node scripts/parse-script-library.js</code> to build the library.
        </p>
      }
    />
  );
}
