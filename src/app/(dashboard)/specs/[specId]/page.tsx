import { SECTIONS_ORDER, SECTION_LABELS, type SpecContent } from "@/types/spec";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { getSpec } from "@/actions/specs";
import { ExportMenu } from "@/components/specs/export-menu";

export default async function SpecPage({
  params,
}: {
  params: Promise<{ specId: string }>;
}) {
  const { specId } = await params;
  const spec = await getSpec(specId);
  const content = (spec.content ?? {}) as SpecContent;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/specs">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Mes specs
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <ExportMenu specId={specId} />
          <Button variant="outline" size="sm" asChild>
            <Link href={`/specs/${specId}/edit`}>
              <Pencil className="h-4 w-4 mr-2" />
              Modifier
            </Link>
          </Button>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-2xl font-semibold">{spec.title}</h1>
          <Badge variant={spec.status === "DONE" ? "default" : "secondary"}>
            {spec.status === "DONE" ? "Générée" : spec.status}
          </Badge>
        </div>
        {spec.prompt && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {spec.prompt}
          </p>
        )}
      </div>

      <div className="space-y-4">
        {SECTIONS_ORDER.map((section) => {
          const sectionContent = content[section];
          if (!sectionContent) return null;

          return (
            <Card key={section}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {SECTION_LABELS[section]}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{sectionContent}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
