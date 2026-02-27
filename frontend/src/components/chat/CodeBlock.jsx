import React, { memo, useCallback, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const Icon = memo(({ path }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {path}
    </svg>
));

const CodeBlock = memo(({ language, children, messageId, index }) => {
    const [copied, setCopied] = useState(false);
    const codeId = `code-${messageId}-${index}`;

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(String(children).replace(/\n$/, '')).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        });
    }, [children]);

    return (
        <div className="code-block-wrapper">
            <div className="code-block-header">
                <span className="code-language">{language}</span>
                <button className="code-copy-btn" onClick={handleCopy} title="Copy code">
                    <Icon path={copied
                        ? <path d="M20 6L9 17l-5-5" />
                        : <><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>
                    } />
                </button>
            </div>
            <SyntaxHighlighter
                children={String(children).replace(/\n$/, '')}
                style={vscDarkPlus}
                language={language}
                PreTag="div"
            />
        </div>
    );
});

CodeBlock.displayName = 'CodeBlock';
export default CodeBlock;
