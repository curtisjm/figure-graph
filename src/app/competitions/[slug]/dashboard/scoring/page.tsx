"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { trpc } from "@shared/lib/trpc";
import { Button } from "@shared/ui/button";
import { Badge } from "@shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@shared/ui/card";
import { Skeleton } from "@shared/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@shared/ui/dialog";
import { toast } from "sonner";
import { Calculator, Eye, CheckCircle2, Send } from "lucide-react";

export default function ScoringPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: comp } = trpc.competition.getBySlug.useQuery({ slug });
  const { data: events } = trpc.event.listByCompetition.useQuery(
    { competitionId: comp?.id ?? 0 },
    { enabled: !!comp },
  );

  const [selectedRoundId, setSelectedRoundId] = useState<number | null>(null);

  if (!comp) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Scoring & Results</h2>

      <p className="text-sm text-muted-foreground">
        Select an event's round to view submission status, compute results, and publish.
      </p>

      {!events?.length ? (
        <div className="text-center py-12 text-muted-foreground">
          No events configured.
        </div>
      ) : (
        <div className="space-y-2">
          {events.map((event) => (
            <EventScoringCard key={event.id} event={event} onSelectRound={setSelectedRoundId} />
          ))}
        </div>
      )}

      {/* Round Detail Dialog */}
      {selectedRoundId && (
        <RoundDetailDialog roundId={selectedRoundId} onClose={() => setSelectedRoundId(null)} />
      )}
    </div>
  );
}

function EventScoringCard({
  event,
  onSelectRound,
}: {
  event: any;
  onSelectRound: (roundId: number) => void;
}) {
  const { data: rounds } = trpc.round.listByEvent.useQuery({ eventId: event.id });

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base">{event.name}</CardTitle>
          <Badge variant="secondary" className="text-xs capitalize">{event.style}</Badge>
          <Badge variant="secondary" className="text-xs capitalize">{event.level}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {!rounds?.length ? (
          <p className="text-sm text-muted-foreground">No rounds generated</p>
        ) : (
          <div className="space-y-1">
            {rounds.map((round: any) => (
              <div
                key={round.id}
                className="flex items-center justify-between p-2 rounded-md border hover:bg-accent/30 cursor-pointer transition-colors"
                onClick={() => onSelectRound(round.id)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm capitalize">
                    {round.roundType.replace(/_/g, " ")}
                  </span>
                  <Badge
                    variant={
                      round.status === "completed" ? "default" : "outline"
                    }
                    className="text-xs capitalize"
                  >
                    {round.status}
                  </Badge>
                </div>
                <Eye className="size-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RoundDetailDialog({
  roundId,
  onClose,
}: {
  roundId: number;
  onClose: () => void;
}) {
  const { data: status } = trpc.scoring.getSubmissionStatus.useQuery({ roundId });
  const { data: results, refetch: refetchResults } = trpc.scoring.getResults.useQuery({ roundId });

  const computeCallback = trpc.scoring.computeCallbackResults.useMutation({
    onSuccess: (result) => {
      refetchResults();
      toast.success(`${result.advanced} of ${result.couples} couples advanced`);
    },
    onError: (err) => toast.error(err.message),
  });

  const computeFinal = trpc.scoring.computeFinalResults.useMutation({
    onSuccess: () => {
      refetchResults();
      toast.success("Final results computed");
    },
    onError: (err) => toast.error(err.message),
  });

  const reviewResults = trpc.scoring.reviewResults.useMutation({
    onSuccess: () => {
      refetchResults();
      toast.success("Results marked as reviewed");
    },
    onError: (err) => toast.error(err.message),
  });

  const publishResults = trpc.scoring.publishResults.useMutation({
    onSuccess: () => {
      refetchResults();
      toast.success("Results published");
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Round Details</DialogTitle>
        </DialogHeader>

        {/* Submission Status */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Judge Submissions</h3>
          {status?.map((judge: any) => (
            <div key={judge.judgeId} className="flex items-center justify-between text-sm">
              <span>{judge.firstName} {judge.lastName}</span>
              <Badge variant={judge.submitted ? "default" : "outline"} className="text-xs">
                {judge.submitted ? "Submitted" : "Pending"}
              </Badge>
            </div>
          ))}
          {!status?.length && (
            <p className="text-sm text-muted-foreground">No judges assigned</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            size="sm"
            onClick={() => computeCallback.mutate({ roundId })}
            disabled={computeCallback.isPending}
          >
            <Calculator className="size-4 mr-2" />
            Compute Callbacks
          </Button>
          <Button
            size="sm"
            onClick={() => computeFinal.mutate({ roundId })}
            disabled={computeFinal.isPending}
          >
            <Calculator className="size-4 mr-2" />
            Compute Final
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => reviewResults.mutate({ roundId })}
            disabled={reviewResults.isPending}
          >
            <CheckCircle2 className="size-4 mr-2" />
            Review
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => publishResults.mutate({ roundId })}
            disabled={publishResults.isPending}
          >
            <Send className="size-4 mr-2" />
            Publish
          </Button>
        </div>

        {/* Results preview */}
        {results?.results?.length ? (
          <div className="space-y-2 pt-2">
            <h3 className="text-sm font-medium">Results</h3>
            {results.results.map((r: any, i: number) => (
              <div key={r.entryId ?? i} className="flex items-center justify-between text-sm p-2 rounded bg-muted/30">
                <span>#{r.placement ?? i + 1}</span>
                <span>{r.leaderName ?? "Unknown"} & {r.followerName ?? "Unknown"}</span>
              </div>
            ))}
          </div>
        ) : null}

        {/* Tabulation */}
        {results?.tabulation?.length ? (
          <div className="space-y-2 pt-2">
            <h3 className="text-sm font-medium">Tabulation</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <tbody>
                  {results.tabulation.map((row, i) => {
                    const data = row.tableData as any;
                    return (
                      <tr key={i} className="border-b">
                        <td className="p-1">{row.entryId}</td>
                        <td className="p-1 text-muted-foreground">{row.danceName}</td>
                        <td className="p-1">{data ? JSON.stringify(data).slice(0, 60) : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
