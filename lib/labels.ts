// lib/labels.ts

/**
 * Centralized label names and emoji mapping for use across the app.
 * Import from this file wherever you need label names or emojis.
 */
export const AVAILABLE_LABELS: string[] = [
    "Frontend",
    "Backend",
    "Fullstack",
    "Design",
    "Testing",
    "Documentation",
    "Urgent",
    "Deferred",
] as const;

export const LABEL_EMOJIS: Record<string, string> = {
    Frontend: "🎨",
    Backend: "⚙️",
    Fullstack: "🌐",
    Design: "🎭",
    Testing: "🧪",
    Documentation: "📚",
    Urgent: "🚨",
    Deferred: "⏳",
};
