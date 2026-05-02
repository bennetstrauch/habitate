// Background colors: light/pastel, used for the app container per day of week
export const DAY_BG_COLORS: Record<number, string> = {
  0: 'rgb(250, 229, 197)', // Sunday    - warm peach
  2: 'rgb(250, 221, 221)', // Tuesday   - rose
  3: '#C8E6C9',            // Wednesday - mint
  4: '#FFE0B2',            // Thursday  - light orange
  5: 'rgb(208, 245, 247)', // Friday    - light cyan
  6: '#BBDEFB',            // Saturday  - light blue
};

// Goal colors: darker counterpart to each background hue, used for goal text
export const DAY_GOAL_COLORS: Record<number, string> = {
  0: 'rgb(255, 200, 117)', // Sunday    - gold
  2: 'rgb(179, 78, 1)',    // Tuesday   - deep orange-red
  3: 'rgb(123, 157, 0)',   // Wednesday - olive green
  4: 'rgb(230, 81, 0)',    // Thursday  - deep orange
  5: 'rgb(5, 165, 173)',   // Friday    - teal
  6: 'rgb(25, 118, 210)',  // Saturday  - blue
};

const DEFAULT_GOAL_COLOR = 'rgb(221, 133, 0)';

export function getTodayBgColor(): string | undefined {
  return DAY_BG_COLORS[new Date().getDay()];
}

export function getTodayGoalColor(): string {
  return DAY_GOAL_COLORS[new Date().getDay()] ?? DEFAULT_GOAL_COLOR;
}
