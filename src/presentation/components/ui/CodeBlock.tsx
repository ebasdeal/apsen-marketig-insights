interface CodeBlockProps {
  children: string;
  'aria-label': string;
  maxHeightClassName?: string;
}

export function CodeBlock({
  children,
  'aria-label': label,
  maxHeightClassName = 'max-h-[360px]',
}: CodeBlockProps) {
  return (
    <pre
      tabIndex={0}
      aria-label={label}
      className={`${maxHeightClassName} overflow-auto whitespace-pre rounded-apsen bg-apsen-code-bg p-[14px] font-mono text-[11.5px] leading-[1.5] text-apsen-code-fg focus-ring`}
    >
      {children}
    </pre>
  );
}
