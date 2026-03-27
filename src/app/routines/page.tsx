import Link from "next/link";
import { getDb } from "@shared/db";
import { dances } from "@syllabus/schema";
import { sortDancesForBrowse } from "@syllabus/components/dance/dance-order";
import {
  Card,
  CardHeader,
  CardTitle,
} from "@shared/ui/card";

export default async function RoutinesPage() {
  const db = getDb();
  const allDances = sortDancesForBrowse(
    await db
      .select({ id: dances.id, name: dances.name, displayName: dances.displayName, timeSignature: dances.timeSignature })
      .from(dances)
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Routines</h1>
          <p className="text-muted-foreground mt-2">
            Select a dance to view and manage your routines.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {allDances.map((dance) => (
            <Link key={dance.id} href={`/routines/dance/${dance.name}`}>
              <Card className="hover:border-foreground/25 transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle>{dance.displayName}</CardTitle>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
