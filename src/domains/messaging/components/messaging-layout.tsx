"use client";

import { usePathname } from "next/navigation";
import { ConversationSidebar } from "./conversation-sidebar";

interface MessagingLayoutProps {
  children: React.ReactNode;
}

export function MessagingLayout({ children }: MessagingLayoutProps) {
  const pathname = usePathname();
  const hasActiveConversation = pathname !== "/messages";

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar: full-screen on mobile when no conversation, always visible on desktop */}
      <div
        className={`${
          hasActiveConversation ? "hidden" : "flex"
        } md:flex w-full md:w-80 flex-col border-r`}
      >
        <ConversationSidebar />
      </div>
      {/* Chat area: full-screen on mobile when conversation active, always visible on desktop */}
      <div
        className={`${
          hasActiveConversation ? "flex" : "hidden"
        } md:flex flex-1 flex-col`}
      >
        {children}
      </div>
    </div>
  );
}
