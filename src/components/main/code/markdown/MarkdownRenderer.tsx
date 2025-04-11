import React from 'react';
import Markdown from 'markdown-to-jsx';
import CodeSnippet from '@/components/main/code/markdown/CodeSnippet';

const markdownOptions = {
    overrides: {
      p: {
        component: (props: { children: React.ReactNode }) => (
          <p style={{ margin: '0.5em 0' }}>
            {props.children}
          </p>
        ),
      },
      pre: {
        component: (props: { children: React.ReactNode }) => (
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              overflowWrap: 'anywhere',
              overflowX: 'hidden',
            }}
          >
            {props.children}
          </pre>
        )
      },
      code: {
        component: CodeSnippet,
      },
      h1: {
        component: (props: any) => (
          <h1 style={{ marginTop: '1em' }} {...props} />
        ),
      },
      h2: {
        component: (props: any) => (
          <h2 style={{ marginTop: '0.75em' }} {...props} />
        ),
      },
      h3: {
        component: (props: any) => (
          <h3 style={{ marginTop: '0.75em' }} {...props} />
        ),
      },
      strong: {
        component: (props: { children: React.ReactNode }) => (
          <strong style={{ fontWeight: 'bold' }}>
            {props.children}
          </strong>
        ),
      },
    },
  };

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <Markdown options={markdownOptions}>
      {content}
    </Markdown>
  );
};

export default MarkdownRenderer;
