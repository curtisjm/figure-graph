"use client";

import DOMPurify from "dompurify";

interface ArticleRendererProps {
  html: string;
}

export function ArticleRenderer({ html }: ArticleRendererProps) {
  const sanitizedHtml = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "h1", "h2", "h3", "p", "br", "strong", "em", "s", "del",
      "ul", "ol", "li", "blockquote", "pre", "code",
      "a", "img", "hr",
    ],
    ALLOWED_ATTR: ["href", "src", "alt", "class", "target", "rel"],
  });

  return (
    <div
      className="prose prose-invert prose-sm max-w-none"
      // Content is sanitized via DOMPurify before rendering
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}
