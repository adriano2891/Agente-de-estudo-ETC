import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="prose prose-sm sm:prose-base prose-blue max-w-none text-slate-700 leading-relaxed">
      <ReactMarkdown
        components={{
          h1: ({node, ...props}) => <h1 className="text-xl font-bold text-primary-800 mt-4 mb-2" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-lg font-bold text-primary-700 mt-3 mb-2" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-md font-semibold text-primary-600 mt-2 mb-1" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-1 my-2" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal pl-5 space-y-1 my-2" {...props} />,
          li: ({node, ...props}) => <li className="text-slate-700" {...props} />,
          strong: ({node, ...props}) => <strong className="font-bold text-slate-900" {...props} />,
          blockquote: ({node, ...props}) => (
            <blockquote className="border-l-4 border-primary-400 pl-4 italic bg-primary-50 py-2 rounded-r my-2" {...props} />
          ),
          code: ({node, ...props}) => (
             // @ts-ignore
            <code className="bg-slate-100 text-pink-600 px-1 py-0.5 rounded text-sm font-mono" {...props} />
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;