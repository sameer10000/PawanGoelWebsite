import { Fragment, type ReactNode } from "react";

/**
 * Deliberately tiny markdown subset — headings, bullets, bold — so the admin
 * text areas stay approachable without shipping a full markdown parser or
 * exposing the site to raw HTML injection.
 */

function inline(text: string): ReactNode {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return <Fragment key={index}>{part}</Fragment>;
  });
}

export function Prose({
  content,
  className = "",
}: {
  content: string;
  className?: string;
}) {
  const blocks = content.trim().split(/\n{2,}/);

  return (
    <div className={`prose-clinical ${className}`}>
      {blocks.map((block, index) => {
        const lines = block.split("\n").map((l) => l.trim());

        if (lines[0]?.startsWith("## ")) {
          return <h2 key={index}>{inline(lines[0].slice(3))}</h2>;
        }

        if (lines.every((l) => l.startsWith("- "))) {
          return (
            <ul key={index}>
              {lines.map((line, i) => (
                <li key={i}>{inline(line.slice(2))}</li>
              ))}
            </ul>
          );
        }

        return <p key={index}>{inline(block.replace(/\n/g, " "))}</p>;
      })}
    </div>
  );
}
