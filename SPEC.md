# ACG Mission Board - Specification

## Project Overview
- **Name:** ACG Mission Board (Command Center)
- **Type:** Web Application (Vite + React)
- **Purpose:** Demo mission board for ACG (Agent Command Grid) - a tactical command center interface
- **Target:** Impress friend with a slick, sci-fi inspired mission control dashboard

## UI/UX Specification

### Layout Structure
- **Header:** Logo + title + status indicator
- **Sidebar:** Mission categories/filters
- **Main Grid:** Mission cards in Kanban-style columns
- **Footer:** Stats bar

### Visual Design
- **Theme:** Dark sci-fi command center
- **Primary:** `#0f172a` (deep navy)
- **Secondary:** `#1e293b` (slate)
- **Accent:** `#06b6d4` (cyan glow)
- **Highlight:** `#f59e0b` (amber/alerts)
- **Success:** `#10b981` (emerald)
- **Danger:** `#ef4444` (red)
- **Text Primary:** `#f8fafc`
- **Text Secondary:** `#94a3b8`
- **Font:** "Orbitron" for headers, "Inter" for body

### Components
1. **Mission Card**
   - Title, description, priority badge
   - Status indicator (Pending/Active/Complete)
   - Assignee avatar
   - Reward points

2. **Status Column**
   - Header with count
   - Scrollable card list
   - Drop zone styling

3. **Priority Badge**
   - Critical (red)
   - High (amber)
   - Medium (cyan)
   - Low (slate)

4. **Stats Bar**
   - Total missions
   - Completed count
   - Active count
   - Points earned

## Functionality Specification

### Core Features
1. **Mission Display** - Show missions in columns: Available → Active → Complete
2. **Mission Details** - Click to expand mission info
3. **Accept Mission** - Move from Available to Active
4. **Complete Mission** - Move from Active to Complete
5. **Points System** - Track earned points
6. **Filtering** - Filter by priority

### Data
- Pre-seeded with 8-10 sample missions
- Local state (no backend)

## Acceptance Criteria

1. ✅ App loads with dark sci-fi theme
2. ✅ Shows 3 columns: Available, Active, Complete
3. ✅ Displays 8-10 mission cards
4. ✅ Clicking "Accept" moves card to Active
5. ✅ Clicking "Complete" moves card to Complete
6. ✅ Points update on completion
7. ✅ Priority badges display correctly
8. ✅ Responsive on mobile

## Technical Stack
- Vite + React
- Tailwind CSS
- Lucide React icons
- Local state (useState)
