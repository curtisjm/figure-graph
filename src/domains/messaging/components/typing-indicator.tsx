"use client";

interface TypingIndicatorProps {
  typingUsers: string[];
  userNames: Map<string, string>;
  currentUserId: string;
}

export function TypingIndicator({ typingUsers, userNames, currentUserId }: TypingIndicatorProps) {
  const others = typingUsers.filter((id) => id !== currentUserId);

  if (others.length === 0) return null;

  const names = others.map((id) => userNames.get(id) ?? "Someone");
  let text: string;

  if (names.length === 1) {
    text = `${names[0]} is typing...`;
  } else if (names.length === 2) {
    text = `${names[0]} and ${names[1]} are typing...`;
  } else {
    text = `${names[0]} and ${names.length - 1} others are typing...`;
  }

  return (
    <div className="px-4 py-1 text-xs text-muted-foreground animate-pulse">
      {text}
    </div>
  );
}
