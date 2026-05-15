Design System & Consistency Guidelines
1. Global Typography & Hierarchy
Font Family: Use 'Plus Jakarta Sans' or 'Inter' globally. Remove all other font references.

Page Titles: All main page titles (e.g., "Money Transfers", "Financial Goals") must use text-3xl (1.875rem), font-bold.

Section Headers: Use text-xl (1.25rem), font-semibold.

Currency Heroes: For large balances, use text-4xl (2.25rem), font-bold, tracking-tighter.

Body Text: Standardize on text-sm (0.875rem) for descriptions and text-xs (0.75rem) for metadata.

2. Unified Color Palette (Semantic Mapping)
Colors must remain consistent across all pages for the same purpose:

Income/Savings: Emerald Green (#10B981)

Expenses/Debt: Rose Red (#EF4444)

General Balance: Electric Blue (#3B82F6)

Analysis/Pending: Royal Purple (#8B5CF6)

Neutral/Data Quality: Amber/Orange (#F59E0B)

3. Standardized Page Layout (The SaaS Structure)
Every page must follow the structure seen in image_5b30b9.jpg:

Page Header Wrapper: A container with p-8 (2rem) padding that includes the Title and Subtitle.

Title Cards: Title cards must NOT vary in height. Use a fixed min-h-[120px] for all top-level page description cards.

Main Content: Content below headers must use a consistent grid (gap-6).

4. Component Styles
Cards: All cards must use rounded-2xl (1rem radius) and a subtle 1px border (border-white/5 in dark, border-gray-200 in light).

Card Padding: Standardize on p-6 for all internal card content.

Progress Bars: Use a thin 6px height with a glowing indicator.

5. Theme Transition (Dark & Light)
Dark Mode (Obsidian): Background #05070A, Cards #0D1117.

Light Mode (Soft Tech): Background #F8FAFC, Cards #FFFFFF.

Logic: Every bg- and text- class must have a corresponding dark: variant to prevent "invisible text" or "grayish residues."