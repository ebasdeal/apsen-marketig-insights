import { describe, expect, it } from 'vitest';
import { crumbDaRota } from '../useCurrentScreen';

describe('crumbDaRota', () => {
  it('distingue visualizar, editar e registrar driver', () => {
    expect(crumbDaRota('/drivers/2', 'Registrar Driver')).toBe('Visualizar Driver');
    expect(crumbDaRota('/drivers/2/editar', 'Registrar Driver')).toBe('Editar Driver');
    expect(crumbDaRota('/drivers/novo', 'Registrar Driver')).toBe('Registrar Driver');
    expect(crumbDaRota('/drivers/catalogo', 'Catálogo de Produtos')).toBe('Catálogo de Produtos');
    expect(crumbDaRota('/drivers/exportar?x=1', 'Exportar JSON')).toBe('Exportar JSON');
  });

  it('usa Editar nas telas de edição de tipo, usuário e agente', () => {
    expect(crumbDaRota('/admin/tipos/tv/editar', 'Novo Tipo')).toBe('Editar Tipo');
    expect(crumbDaRota('/admin/tipos/novo', 'Novo Tipo')).toBe('Novo Tipo');
    expect(crumbDaRota('/acesso/usuarios/u1/editar', 'Novo Usuário')).toBe('Editar Usuário');
    expect(crumbDaRota('/agentes/a1/editar', 'Novo Agente')).toBe('Editar Agente');
  });
});
