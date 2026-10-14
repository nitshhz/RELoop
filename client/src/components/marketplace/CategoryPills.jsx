import React from 'react';
import {
  Smartphone,
  Laptop,
  Headphones,
  Armchair,
  Gamepad2,
  Camera,
  BookOpen,
  Dumbbell,
  Shirt,
  LayoutGrid,
} from 'lucide-react';

const iconMap = {
  Smartphone,
  Laptop,
  Headphones,
  Armchair,
  Gamepad2,
  Camera,
  BookOpen,
  Dumbbell,
  Shirt,
};

export function CategoryPills({ categories = [], selectedId, onSelect }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none select-none">
      {/* "All Categories" Pill */}
      <button
        onClick={() => onSelect(null)}
        className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 min-h-[40px] ${
          selectedId === null
            ? 'bg-brand-green text-white shadow-md'
            : 'bg-white border border-border-subtle text-text-primary hover:bg-background-secondary'
        }`}
      >
        <LayoutGrid className="w-3.5 h-3.5" />
        All Items
      </button>

      {categories.map((cat) => {
        const Icon = iconMap[cat.icon] || LayoutGrid;
        const isSelected = selectedId === cat.id;

        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 min-h-[40px] ${
              isSelected
                ? 'bg-brand-green text-white shadow-md'
                : 'bg-white border border-border-subtle text-text-primary hover:bg-background-secondary'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {cat.name}
            {cat.listingsCount !== undefined && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-background-secondary text-text-muted'
                }`}
              >
                {cat.listingsCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
