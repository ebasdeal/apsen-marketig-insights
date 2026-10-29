'use client';

import { useEffect } from 'react';
import { rehydrateSessao } from '../stores/sessaoStore';

export function SessionSync() {
  useEffect(() => {
    rehydrateSessao();
  }, []);
  return null;
}
