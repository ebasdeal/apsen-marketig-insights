import type { NivelEstoque } from '@domain/analises/Analise';

interface TomFamilia {
  texto: string;
  borda: string;
}

const TONS: Record<string, TomFamilia> = {
  Imunologia: { texto: 'text-apsen-pal-purple', borda: 'border-apsen-pal-purple/[.125]' },
  Cardio: { texto: 'text-apsen-pal-blue', borda: 'border-apsen-pal-blue/[.125]' },
  Dermatologia: { texto: 'text-apsen-pal-amber', borda: 'border-apsen-pal-amber/[.125]' },
  Neurologia: { texto: 'text-apsen-pal-blue', borda: 'border-apsen-pal-blue/[.125]' },
  Reumatologia: { texto: 'text-apsen-pal-emerald', borda: 'border-apsen-pal-emerald/[.125]' },
  Endocrinologia: { texto: 'text-apsen-pal-cyan', borda: 'border-apsen-pal-cyan/[.125]' },
  Gastro: { texto: 'text-apsen-pal-lime', borda: 'border-apsen-pal-lime/[.125]' },
};

const PADRAO: TomFamilia = {
  texto: 'text-apsen-pal-slate',
  borda: 'border-apsen-pal-slate/[.125]',
};

export function tomDaFamilia(familia: string): TomFamilia {
  return TONS[familia] ?? PADRAO;
}

const ESTOQUE: Record<NivelEstoque, string> = {
  critico: 'text-apsen-red',
  atencao: 'text-apsen-yellow',
  ok: 'text-apsen-green',
};

export function tomEstoque(nivel: NivelEstoque): string {
  return ESTOQUE[nivel];
}
