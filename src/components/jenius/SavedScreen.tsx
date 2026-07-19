import * as React from "react";
import { Search, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { JeniusMark } from "./JeniusMark";
import { EmptyState } from "./EmptyState";
import { SavedCard } from "./SavedCard";
import { SubjectChip } from "./SubjectChip";
import {
  MOCK_SAVED_ITEMS,
  SAVED_COLLECTIONS,
  type SavedCollectionId,
  type SavedItem,
} from "@/lib/jenius/savedCollections";
import { SUBJECTS, type SubjectId } from "@/lib/jenius/types";

export interface SavedScreenProps {
  items?: SavedItem[];
  /** When true, shows an offline notice above the list. */
  offline?: boolean;
  onReplay?: (conceptId: string) => void;
}

/**
 * SavedScreen — two-collection saved view (Mind Blown / I Finally Get It)
 * with subject filters and a search field. Content-agnostic: pass in your
 * own items to preview populated / empty / offline states.
 */
export function SavedScreen({
  items = MOCK_SAVED_ITEMS,
  offline = false,
  onReplay,
}: SavedScreenProps) {
  const [collection, setCollection] = React.useState<SavedCollectionId>("mind-blown");
  const [query, setQuery] = React.useState("");
  const [subjectFilter, setSubjectFilter] = React.useState<SubjectId | "all">("all");
  const [localItems, setLocalItems] = React.useState<SavedItem[]>(items);

  React.useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const inCollection = localItems.filter((i) => i.collection === collection);
  const subjectsAvailable = React.useMemo(
    () => Array.from(new Set(inCollection.map((i) => i.subject))),
    [inCollection],
  );

  const filtered = inCollection.filter((i) => {
    if (subjectFilter !== "all" && i.subject !== subjectFilter) return false;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      const hay = `${i.hook} ${i.takeaway} ${i.category}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const remove = (id: string) =>
    setLocalItems((prev) => prev.filter((i) => i.conceptId !== id));

  return (
    <div className="flex flex-col gap-5 px-5 pb-24 pt-4">
      <header className="flex items-center gap-3">
        <JeniusMark size={28} />
        <h1 className="font-display text-[26px] font-semibold tracking-tight">Saved</h1>
      </header>

      {/* Collection tabs */}
      <div
        role="tablist"
        aria-label="Saved collections"
        className="glass flex rounded-full p-1"
      >
        {SAVED_COLLECTIONS.map((c) => {
          const active = c.id === collection;
          return (
            <button
              key={c.id}
              role="tab"
              aria-selected={active}
              type="button"
              onClick={() => setCollection(c.id)}
              className={cn(
                "flex-1 rounded-full px-3 py-2 text-[13px] font-medium transition-swift",
                active
                  ? "gradient-brand text-primary-foreground shadow-glow"
                  : "text-foreground/70 hover:text-foreground",
              )}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      <p className="-mt-2 text-[12px] leading-relaxed text-foreground/55">
        {SAVED_COLLECTIONS.find((c) => c.id === collection)?.description}
      </p>

      {/* Search */}
      <label
        className={cn(
          "flex h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3.5",
          "focus-within:border-brand-blue/60",
        )}
      >
        <Search className="size-4 text-foreground/50" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search saved concepts"
          className="min-w-0 flex-1 bg-transparent text-[14px] text-foreground placeholder:text-foreground/45 focus:outline-none"
        />
      </label>

      {/* Subject filter chips */}
      {subjectsAvailable.length > 1 ? (
        <div className="-mx-1 flex gap-2 overflow-x-auto no-scrollbar px-1">
          <FilterChip
            active={subjectFilter === "all"}
            onClick={() => setSubjectFilter("all")}
            label="All subjects"
          />
          {subjectsAvailable.map((s) => (
            <SubjectChip
              key={s}
              subject={s}
              size="sm"
              label={SUBJECTS[s].label}
              onClick={() => setSubjectFilter(s)}
              className={cn(
                "cursor-pointer whitespace-nowrap",
                subjectFilter !== s && "opacity-60",
              )}
            />
          ))}
        </div>
      ) : null}

      {offline ? (
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[12px] text-foreground/75">
          <WifiOff className="size-3.5" aria-hidden />
          Offline — showing saved concepts stored on your device.
        </div>
      ) : null}

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          title={
            inCollection.length === 0
              ? "Nothing saved here yet"
              : "No matches"
          }
          description={
            inCollection.length === 0
              ? collection === "mind-blown"
                ? "Save the ideas that make you go “wait, what?”"
                : "Save the ones that finally clicked for you."
              : "Try a different search or subject filter."
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((item) => (
            <li key={item.conceptId}>
              <SavedCard
                {...item}
                onReplay={onReplay}
                onRemove={remove}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "whitespace-nowrap rounded-full border px-3 py-1.5 text-[12px] font-medium transition-swift",
        active
          ? "border-transparent bg-white/15 text-foreground"
          : "border-white/10 bg-transparent text-foreground/60 hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}
