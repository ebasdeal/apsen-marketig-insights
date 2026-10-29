import type { SegmentoTexto } from '@domain/analises/Analise';

export function RichText({ segmentos }: { segmentos: readonly SegmentoTexto[] }) {
  if (segmentos.length === 0) {
    return <p className="text-[13.5px] leading-[1.75]">—</p>;
  }
  return (
    <p className="text-[13.5px] leading-[1.75]">
      {segmentos.map((segmento, index) =>
        segmento.forte ? <strong key={index}>{segmento.texto}</strong> : segmento.texto,
      )}
    </p>
  );
}
