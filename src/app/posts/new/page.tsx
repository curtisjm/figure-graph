import { ArticleEditor } from "@/domains/social/components/article-editor";

export default function NewArticlePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-xl font-bold mb-4 sm:text-2xl sm:mb-6">Write Article</h1>
      <ArticleEditor />
    </div>
  );
}
