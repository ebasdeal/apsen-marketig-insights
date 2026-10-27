import { nextTabIndex } from '../tabKeys';

describe('nextTabIndex', () => {
  it('avança e volta de forma circular', () => {
    expect(nextTabIndex(0, 3, 'ArrowRight')).toBe(1);
    expect(nextTabIndex(2, 3, 'ArrowRight')).toBe(0);
    expect(nextTabIndex(1, 3, 'ArrowLeft')).toBe(0);
    expect(nextTabIndex(0, 3, 'ArrowLeft')).toBe(2);
  });

  it('vai para as pontas com Home e End e ignora outras teclas', () => {
    expect(nextTabIndex(2, 3, 'Home')).toBe(0);
    expect(nextTabIndex(0, 3, 'End')).toBe(2);
    expect(nextTabIndex(1, 3, 'Enter')).toBeNull();
  });
});
