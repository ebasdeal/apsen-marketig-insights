import { escapeRegex } from '../escapeRegex';

describe('escapeRegex', () => {
  it('escapa os metacaracteres do regex', () => {
    expect(escapeRegex('MOTILEX HA + MSM')).toBe('MOTILEX HA \\+ MSM');
    expect(escapeRegex('.*+?^${}()|[]\\')).toBe('\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\');
    expect(escapeRegex('LEVOXIN')).toBe('LEVOXIN');
  });
});
