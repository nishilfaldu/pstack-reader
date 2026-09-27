import { renderMermaidSVG } from 'beautiful-mermaid';

export function Mermaid({ chart }: { chart: string }) {
  const svg = renderMermaidSVG(chart, {
    bg: 'var(--color-fd-card)',
    fg: 'var(--color-fd-foreground)',
    transparent: true,
  });
  return <div className="mermaid-diagram" role="img" aria-label="Flow diagram" dangerouslySetInnerHTML={{ __html: svg }} />;
}
