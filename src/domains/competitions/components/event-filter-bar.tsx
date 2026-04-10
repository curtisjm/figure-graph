"use client";

import { Input } from "@shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/ui/select";
import { Search } from "lucide-react";

const STYLES = ["standard", "smooth", "latin", "rhythm", "nightclub"] as const;
const LEVELS = [
  "newcomer", "bronze", "silver", "gold", "novice", "prechamp", "champ", "professional",
] as const;
const EVENT_TYPES = ["single_dance", "multi_dance"] as const;

const EVENT_TYPE_LABELS: Record<string, string> = {
  single_dance: "Single Dance",
  multi_dance: "Multi Dance",
};

interface EventFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  styleFilter: string;
  onStyleChange: (s: string) => void;
  levelFilter: string;
  onLevelChange: (l: string) => void;
  typeFilter: string;
  onTypeChange: (t: string) => void;
}

export function EventFilterBar({
  searchQuery,
  onSearchChange,
  styleFilter,
  onStyleChange,
  levelFilter,
  onLevelChange,
  typeFilter,
  onTypeChange,
}: EventFilterBarProps) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search events..."
          className="pl-9"
        />
      </div>
      <div className="flex gap-2 flex-wrap">
        <Select value={styleFilter} onValueChange={onStyleChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Styles</SelectItem>
            {STYLES.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={levelFilter} onValueChange={onLevelChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            {LEVELS.map((l) => (
              <SelectItem key={l} value={l} className="capitalize">
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={onTypeChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Event Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {EVENT_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {EVENT_TYPE_LABELS[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
