"use client";

import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "../../../utils/cn";

interface MarkdownViewerProps {
  content: string;
  className?: string;
}

// ─── Mermaid Diagram ─────────────────────────────────────────────────────────
function MermaidDiagram({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function render() {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({ startOnLoad: false, theme: "dark", securityLevel: "loose" });
        const id = `mermaid-${Math.random().toString(36).slice(2)}`;
        const { svg } = await mermaid.render(id, code);
        if (!cancelled && ref.current) {
          ref.current.innerHTML = svg;
        }
      } catch (e: any) {
        if (!cancelled) setError(e.message);
      }
    }
    render();
    return () => { cancelled = true; };
  }, [code]);

  if (error) {
    return (
      <div className="bg-red-950/20 border border-red-500/20 rounded-lg p-3 text-xs text-red-400">
        Diagram error: {error}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="bg-muted/30 border border-border/50 rounded-xl p-4 overflow-x-auto flex justify-center"
    />
  );
}

// ─── Code block with copy button ─────────────────────────────────────────────
function CodeBlock({ children, className }: { children: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const language = className?.replace("language-", "") ?? "text";
  const isMermaid = language === "mermaid";

  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isMermaid) return <MermaidDiagram code={children} />;

  return (
    <div className="relative group my-3">
      <div className="flex items-center justify-between bg-muted/60 border border-border/60 rounded-t-lg px-3 py-1.5">
        <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">{language}</span>
        <button
          onClick={handleCopy}
          className="text-[10px] text-muted-foreground hover:text-foreground transition px-2 py-0.5 rounded bg-background/40"
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
      <pre className="bg-muted/40 border border-border/60 border-t-0 rounded-b-lg p-4 overflow-x-auto text-xs font-mono leading-relaxed text-foreground/90">
        <code>{children}</code>
      </pre>
    </div>
  );
}

// ─── Main Markdown Viewer ─────────────────────────────────────────────────────
export function MarkdownViewer({ content, className }: MarkdownViewerProps) {
  return (
    <div
      className={cn(
        "prose prose-sm max-w-none",
        "prose-headings:text-foreground prose-headings:font-heading prose-headings:font-extrabold",
        "prose-p:text-foreground/85 prose-p:leading-relaxed",
        "prose-strong:text-foreground prose-strong:font-bold",
        "prose-em:text-foreground/80",
        "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
        "prose-blockquote:border-l-primary/40 prose-blockquote:text-muted-foreground prose-blockquote:bg-primary/5 prose-blockquote:rounded-r-lg prose-blockquote:py-1",
        "prose-table:border-collapse prose-th:bg-muted/60 prose-th:text-foreground prose-td:border-border/40",
        "prose-ul:text-foreground/85 prose-ol:text-foreground/85",
        "prose-li:marker:text-primary",
        "prose-hr:border-border/40",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }: any) {
            const isBlock = !props.inline;
            if (isBlock) {
              return (
                <CodeBlock className={className}>
                  {String(children).replace(/\n$/, "")}
                </CodeBlock>
              );
            }
            return (
              <code
                className="bg-muted/60 text-primary/90 rounded px-1 py-0.5 text-[11px] font-mono"
                {...props}
              >
                {children}
              </code>
            );
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-4">
                <table className="w-full text-xs border border-border/40 rounded-lg overflow-hidden">
                  {children}
                </table>
              </div>
            );
          },
          th({ children }) {
            return (
              <th className="bg-muted/60 text-foreground font-bold px-3 py-2 text-left border-b border-border/40">
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td className="px-3 py-2 border-b border-border/20 text-foreground/80">
                {children}
              </td>
            );
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-primary/40 bg-primary/5 pl-4 pr-3 py-2 rounded-r-lg my-3 text-white/90 italic text-sm">
                {children}
              </blockquote>
            );
          },
          h1({ children }) {
            return <h1 className="text-xl font-heading font-extrabold text-foreground mt-6 mb-3">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-base font-heading font-bold text-foreground mt-5 mb-2 border-b border-border/30 pb-1">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-sm font-heading font-bold text-foreground mt-4 mb-1.5">{children}</h3>;
          },
          p({ children }) {
            return <div className="mb-3 text-foreground/85 leading-relaxed">{children}</div>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default MarkdownViewer;
