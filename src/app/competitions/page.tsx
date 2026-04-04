"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@shared/lib/trpc";
import { Button } from "@shared/ui/button";
import { Skeleton } from "@shared/ui/skeleton";
import { CompetitionCard } from "@competitions/components/competition-card";
import { cn } from "@shared/lib/utils";
import { Plus } from "lucide-react";

const statusFilters = [
  { label: "All", value: undefined },
  { label: "Upcoming", value: "accepting_entries" as const },
  { label: "Running", value: "running" as const },
  { label: "Finished", value: "finished" as const },
] as const;

type StatusFilter = (typeof statusFilters)[number]["value"];

export default function CompetitionsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(undefined);

  const { data, isLoading } = trpc.competition.list.useQuery({
    status: statusFilter,
    limit: 20,
  });

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Competitions</h1>
        <Link href="/competitions/create">
          <Button>
            <Plus className="size-4 mr-2" />
            Create Competition
          </Button>
        </Link>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 mb-6 p-1 bg-muted rounded-lg w-fit">
        {statusFilters.map((filter) => (
          <button
            key={filter.label}
            onClick={() => setStatusFilter(filter.value)}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
              statusFilter === filter.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border p-4 space-y-3">
              <div className="flex items-start justify-between">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      ) : !data?.items.length ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            {statusFilter
              ? "No competitions match this filter."
              : "No competitions yet. Create the first one!"}
          </p>
          {!statusFilter && (
            <Link href="/competitions/create">
              <Button variant="outline">Create Competition</Button>
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {data.items.map((comp) => (
              <CompetitionCard
                key={comp.id}
                competition={comp}
                orgName={comp.orgName}
              />
            ))}
          </div>

          {data.nextCursor && (
            <div className="mt-6 text-center">
              <Button variant="outline" size="sm">
                Load more
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
