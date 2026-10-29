import { render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import DriverPage, { metadata as viewMeta } from '../[id]/page';
import EditarPage, { metadata as editMeta } from '../[id]/editar/page';
import DriverLoading from '../[id]/loading';
import DriverNotFoundPage from '../[id]/not-found';
import CatalogoPage, { metadata as catalogoMeta } from '../catalogo/page';
import CatalogoLoading from '../catalogo/loading';
import FamiliaPage, { metadata as familiaMeta } from '../catalogo/[familia]/page';
import FamiliaNotFoundPage from '../catalogo/[familia]/not-found';
import ExportarPage, { metadata as exportMeta } from '../exportar/page';
import ExportarLoading from '../exportar/loading';
import DriversLoading from '../loading';
import NovoPage, { metadata as novoMeta } from '../novo/page';
import NovoLoading from '../novo/loading';
import DriversPage, { metadata as listaMeta } from '../page';
import {
  catalogoFamiliaRoute,
  driverRoute,
  editarDriverRoute,
  firstParam,
  novoDriverRoute,
  voltarRoute,
} from '@presentation/features/drivers/driverRoutes';

type Props = { mode?: string; driverId?: string; familia?: string };

describe('rotas de drivers', () => {
  it('metadata de cada rota', () => {
    expect(
      [listaMeta, novoMeta, viewMeta, editMeta, exportMeta, catalogoMeta, familiaMeta].map(
        (m) => m.title,
      ),
    ).toEqual([
      'Meus Registros',
      'Registrar Driver',
      'Visualizar Driver',
      'Editar Driver',
      'Exportar JSON',
      'Catálogo de Produtos',
      'Drivers da Família',
    ]);
  });

  it('páginas passam modo, id e família (array usa o primeiro)', async () => {
    const novo = (await NovoPage({
      searchParams: Promise.resolve({ familia: ['LEVOXIN', 'X'] }),
    })) as ReactElement<Props>;
    expect(novo.props).toMatchObject({ mode: 'new', familia: 'LEVOXIN' });
    const view = (await DriverPage({
      params: Promise.resolve({ id: '3' }),
      searchParams: Promise.resolve({}),
    })) as ReactElement<Props>;
    expect(view.props).toMatchObject({ mode: 'view', driverId: '3' });
    expect(view.props.familia).toBeUndefined();
    const edit = (await EditarPage({
      params: Promise.resolve({ id: '3' }),
      searchParams: Promise.resolve({ familia: 'LEVOXIN' }),
    })) as ReactElement<Props>;
    expect(edit.props).toMatchObject({ mode: 'edit', driverId: '3', familia: 'LEVOXIN' });
    const familia = (await FamiliaPage({
      params: Promise.resolve({ familia: 'MOTILEX%20HA%20%2B%20MSM' }),
    })) as ReactElement<{ children: ReactElement<Props> }>;
    expect(familia.props.children.props.familia).toBe('MOTILEX HA + MSM');
    expect(DriversPage()).toBeTruthy();
    expect(ExportarPage()).toBeTruthy();
    expect(CatalogoPage()).toBeTruthy();
  });

  it('loading e not-found', () => {
    render(
      <>
        <DriversLoading />
        <NovoLoading />
        <DriverLoading />
        <ExportarLoading />
        <CatalogoLoading />
      </>,
    );
    expect(screen.getAllByRole('status', { name: 'Carregando formulário…' })).toHaveLength(2);
    expect(screen.getByRole('status', { name: 'Gerando JSON…' })).toBeInTheDocument();
    render(<DriverNotFoundPage />);
    expect(screen.getByRole('link', { name: '← Voltar aos registros' })).toHaveAttribute(
      'href',
      '/drivers',
    );
    render(<FamiliaNotFoundPage />);
    expect(screen.getByRole('link', { name: '← Voltar ao catálogo' })).toHaveAttribute(
      'href',
      '/drivers/catalogo',
    );
  });

  it('helpers de rota', () => {
    expect(novoDriverRoute()).toBe('/drivers/novo');
    expect(novoDriverRoute('MOTILEX HA + MSM')).toBe(
      '/drivers/novo?familia=MOTILEX%20HA%20%2B%20MSM',
    );
    expect(driverRoute('3', 'LEVOXIN')).toBe('/drivers/3?familia=LEVOXIN');
    expect(editarDriverRoute('3')).toBe('/drivers/3/editar');
    expect(catalogoFamiliaRoute('A B')).toBe('/drivers/catalogo/A%20B');
    expect(voltarRoute(undefined)).toBe('/drivers');
    expect(voltarRoute('LEVOXIN')).toBe('/drivers/catalogo/LEVOXIN');
    expect(firstParam('')).toBeUndefined();
    expect(firstParam(undefined)).toBeUndefined();
  });
});
