import { ArticleEditor } from "@/domains/social/components/article-editor";

export default function NewArticlePage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">Write Article</h1>
      <ArticleEditor />
    </div>
  );
}
