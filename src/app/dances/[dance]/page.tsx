import { notFound } from "next/navigation";
import Link from "next/link";
import { eq, asc } from "drizzle-orm";
import { Button } from "@shared/ui/button";
import { Separator } from "@shared/ui/separator";
import { getDb } from "@shared/db";
import { dances, figures } from "@syllabus/schema";
import { FigureListFilters } from "@syllabus/components/dance/figure-list-filters";

export default async function DancePage({
  params,
}: {
  params: Promise<{ dance: string }>;
}) {
  const { dance: danceSlug } = await params;
  const db = getDb();

  const [dance] = await db
    .select()
    .from(dances)
    .where(eq(dances.name, danceSlug));

  if (!dance) notFound();

  const danceFigures = await db
    .select({
      id: figures.id,
      name: figures.name,
      variantName: figures.variantName,
      level: figures.level,
      figureNumber: figures.figureNumber,
    })
    .from(figures)
    .where(eq(figures.danceId, dance.id))
    .orderBy(asc(figures.figureNumber), asc(figures.name));

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {dance.displayName}
            </h1>
          </div>
          <Button asChild variant="outline">
            <Link href={`/dances/${danceSlug}/graph`}>View Graph</Link>
          </Button>
        </div>

        <Separator />

        <FigureListFilters danceSlug={danceSlug} figures={danceFigures} />
      </div>
    </div>
  );
}
