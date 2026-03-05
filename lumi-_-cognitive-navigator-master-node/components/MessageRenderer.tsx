import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { Copy, Check } from 'lucide-react';

interface MessageRendererProps {
  content: string;
  color?: string;
  isUser?: boolean;
}

export const MessageRenderer: React.FC<MessageRendererProps> = ({ content, color, isUser }) => {
  if (isUser) {
    return <div className="whitespace-pre-wrap">{`> ${content}`}</div>;
  }

  return (
    <div className="markdown-body text-[14px] leading-relaxed tracking-wide">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          h1: ({ node, ...props }) => <h1 className="text-xl font-bold mt-6 mb-4" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-lg font-bold mt-5 mb-3" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-base font-bold mt-4 mb-2" {...props} />,
          p: ({ node, ...props }) => <p className="mb-4 last:mb-0" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 space-y-1" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4 space-y-1" {...props} />,
          li: ({ node, ...props }) => <li {...props} />,
          strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
          em: ({ node, ...props }) => <em className="italic" {...props} />,
          code: ({ className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');
            
            if (!match) {
              return (
                <code className="bg-white/10 px-1.5 py-0.5 rounded text-[13px] font-['JetBrains_Mono',_Consolas,_'Courier_New',_monospace]" {...props}>
                  {children}
                </code>
              );
            }

            const language = match[1];
            const codeString = String(children).replace(/\n$/, '');

            return <CodeBlock language={language} code={codeString} />;
          },
          pre: ({ children }) => <>{children}</>,
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-2 border-white/20 pl-4 italic opacity-80 my-4" {...props} />
          ),
          hr: ({ node, ...props }) => <hr className="border-white/10 my-6" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

const CodeBlock = ({ language, code }: { language: string; code: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-white/10 bg-[#111111] shadow-lg">
      <div className="flex items-center justify-between px-4 py-2 bg-[#1a1a1a] border-b border-white/5 text-xs text-white/50 font-['JetBrains_Mono',_Consolas,_'Courier_New',_monospace]">
        <span className="capitalize">{language === 'text' ? 'Plaintext' : language}</span>
        <button 
          onClick={handleCopy}
          className="hover:text-white transition-colors flex items-center gap-1.5"
          title="Copy code"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
      <div className="p-4 overflow-x-auto custom-scrollbar">
        <pre className="text-[13px] leading-[1.2] font-['JetBrains_Mono',_Consolas,_'Courier_New',_monospace] text-white/80 m-0">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};
