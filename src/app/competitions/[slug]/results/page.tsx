"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { trpc } from "@shared/lib/trpc";
import { Badge } from "@shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@shared/ui/card";
import { Skeleton } from "@shared/ui/skeleton";
import { Trophy, ChevronDown, ChevronRight } from "lucide-react";

export default function ResultsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: comp, isLoading: compLoading } = trpc.competition.getBySlug.useQuery({ slug });
  const { data: events } = trpc.event.listByCompetition.useQuery(
    { competitionId: comp?.id ?? 0 },
    { enabled: !!comp },
  );

  const [expandedEvent, setExpandedEvent] = useState<number | null>(null);

  if (compLoading || !comp) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4 space-y-4">
        <Skeleton className="h-10 w-64" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center gap-3">
        <Trophy className="size-6 text-yellow-500" />
        <div>
          <h1 className="text-2xl font-bold">{comp.name}</h1>
          <p className="text-muted-foreground">Results</p>
        </div>
      </div>

      {!events?.length ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No events available.
          </CardContent>
        </Card>
      ) : (
        events.map((event) => (
          <EventResultCard
            key={event.id}
            event={event}
            expanded={expandedEvent === event.id}
            onToggle={() =>
              setExpandedEvent(expandedEvent === event.id ? null : event.id)
            }
          />
        ))
      )}
    </div>
  );
}

function EventResultCard({
  event,
  expanded,
  onToggle,
}: {
  event: any;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { data: rounds } = trpc.round.listByEvent.useQuery(
    { eventId: event.id },
    { enabled: expanded },
  );

  // Find the final round
  const finalRound = rounds?.find((r: any) => r.roundType === "final");

  const { data: results } = trpc.scoring.getResults.useQuery(
    { roundId: finalRound?.id ?? 0 },
    { enabled: !!finalRound },
  );

  return (
    <Card>
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent/30 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          {expanded ? (
            <ChevronDown className="size-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="size-4 text-muted-foreground" />
          )}
          <div>
            <span className="text-sm font-medium">{event.name}</span>
            <div className="flex gap-1 mt-0.5">
              <Badge variant="secondary" className="text-xs capitalize">{event.style}</Badge>
              <Badge variant="secondary" className="text-xs capitalize">{event.level}</Badge>
            </div>
          </div>
        </div>
      </div>

      {expanded && (
        <CardContent className="pt-0 pb-4">
          {!results?.results?.length ? (
            <p className="text-sm text-muted-foreground py-2">
              Results not yet published.
            </p>
          ) : (
            <div className="space-y-1">
              {results.results.map((r: any, i: number) => (
                <div
                  key={r.entryId ?? i}
                  className="flex items-center gap-3 p-2 rounded-md border"
                >
                  <span className={`text-sm font-bold w-8 text-right ${
                    (r.placement ?? i + 1) <= 3 ? "text-yellow-600" : "text-muted-foreground"
                  }`}>
                    {r.placement ?? i + 1}
                  </span>
                  <div className="min-w-0">
                    <span className="text-sm">
                      {r.leaderName ?? "Unknown"} & {r.followerName ?? "Unknown"}
                    </span>
                    {r.orgName && (
                      <span className="text-xs text-muted-foreground ml-2">{r.orgName}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tabulation table */}
          {results?.tabulation?.length ? (
            <div className="mt-4">
              <h4 className="text-xs font-medium text-muted-foreground mb-2">Tabulation</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <tbody>
                    {results.tabulation.map((row, i) => {
                      const data = row.tableData as any;
                      return (
                        <tr key={i} className="border-b">
                          <td className="p-1 font-mono">{row.entryId}</td>
                          <td className="p-1 text-muted-foreground">{row.danceName}</td>
                          <td className="p-1">{data ? JSON.stringify(data).slice(0, 80) : "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </CardContent>
      )}
    </Card>
  );
}
