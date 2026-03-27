"use client";

import { useState } from "react";
import { trpc } from "@shared/lib/trpc";
import { Button } from "@shared/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@shared/ui/tabs";
import { PostCard } from "./post-card";

export function Feed() {
  const [activeTab, setActiveTab] = useState<"following" | "explore">("following");

  return (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "following" | "explore")}>
      <TabsList>
        <TabsTrigger value="following">Following</TabsTrigger>
        <TabsTrigger value="explore">Explore</TabsTrigger>
      </TabsList>

      <TabsContent value="following" className="mt-4">
        <FollowingFeed />
      </TabsContent>

      <TabsContent value="explore" className="mt-4">
        <ExploreFeed />
      </TabsContent>
    </Tabs>
  );
}

function FollowingFeed() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    trpc.feed.following.useInfiniteQuery(
      { limit: 20 },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  const allPosts = data?.pages.flatMap((page) => page.posts) ?? [];

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Loading...</p>;
  }

  if (allPosts.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No posts yet. Follow other dancers to see their posts here.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {allPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      {hasNextPage && (
        <Button
          variant="ghost"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="w-full"
        >
          {isFetchingNextPage ? "Loading..." : "Load more"}
        </Button>
      )}
    </div>
  );
}

function ExploreFeed() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    trpc.feed.explore.useInfiniteQuery(
      { limit: 20 },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  const allPosts = data?.pages.flatMap((page) => page.posts) ?? [];

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Loading...</p>;
  }

  if (allPosts.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No public posts yet. Be the first to share something!
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {allPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      {hasNextPage && (
        <Button
          variant="ghost"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="w-full"
        >
          {isFetchingNextPage ? "Loading..." : "Load more"}
        </Button>
      )}
    </div>
  );
}
