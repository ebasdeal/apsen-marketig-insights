import { render } from '@testing-library/react';
import { useNav } from '../NavContext';

function Consumer() {
  useNav();
  return null;
}

describe('useNav', () => {
  it('exige NavProvider', () => {
    expect(() => render(<Consumer />)).toThrow('useNav precisa estar dentro de NavProvider');
  });
});
