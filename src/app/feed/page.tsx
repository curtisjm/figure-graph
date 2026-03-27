import { Feed } from "@/domains/social/components/feed";

export default function FeedPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">Feed</h1>
      <Feed />
    </div>
  );
}
