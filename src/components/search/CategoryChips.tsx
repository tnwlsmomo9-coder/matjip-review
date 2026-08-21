"use client";

import { CATEGORY_GROUPS, type CategoryFilterValue } from "@/lib/kakao-local";

interface CategoryChipsProps {
  selected: CategoryFilterValue;
  onSelect: (value: CategoryFilterValue) => void;
}

export default function CategoryChips({ selected, onSelect }: CategoryChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORY_GROUPS.map((group) => {
        const isActive = selected === group.value;
        return (
          <button
            key={group.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelect(group.value)}
            className={
              isActive
                ? "rounded-[10px] bg-accent px-4 py-2 text-sm font-bold text-white"
                : "rounded-[10px] border border-hairline px-4 py-2 text-sm font-medium text-ink"
            }
          >
            {group.label}
          </button>
        );
      })}
    </div>
  );
}
