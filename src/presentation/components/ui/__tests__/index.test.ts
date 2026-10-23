import * as ui from '../index';

describe('ui index', () => {
  it('reexporta todos os componentes do kit', () => {
    expect(Object.keys(ui).sort()).toEqual([
      'ActionGroup',
      'Badge',
      'BarRow',
      'Button',
      'ButtonLink',
      'CHANNEL_FILL_COLORS',
      'CHANNEL_PILL_COLORS',
      'Card',
      'CardTitle',
      'ChannelPill',
      'ChevronRightIcon',
      'ChipGroup',
      'EmptyState',
      'ErrorState',
      'EyeIcon',
      'FormSelect',
      'IconButton',
      'IconLink',
      'InlineEmpty',
      'KpiCard',
      'LoadingState',
      'PageHeader',
      'Pagination',
      'ProgressBar',
      'ResultSummary',
      'ScreenDesc',
      'SearchInput',
      'Section',
      'StatusBadge',
      'TextLink',
      'buttonClasses',
    ]);
  });
});
