'use client';

import type { Route } from 'next';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Alert } from '../../components/ui/Alert';
import { FullScreenLoader } from '../../components/ui/FullScreenLoader';
import { safeNext } from '../../navigation/safeNext';
import { useUseCases } from '../../providers/UseCasesContext';
import { useSessaoStore } from '../../stores/sessaoStore';
import { authErrorMessage } from './authErrorMessage';

interface LoginScreenProps {
  ambiente: string;
  suporteUrl?: string | undefined;
}

export function LoginScreen({ ambiente, suporteUrl }: LoginScreenProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const useCases = useUseCases();
  const hidratado = useSessaoStore((state) => state.hidratado);
  const sessao = useSessaoStore((state) => state.sessao);
  const destino = safeNext(searchParams.get('retorno'));
  const [erro, setErro] = useState<string | null>(null);
  const [redirecionando, setRedirecionando] = useState(false);

  useEffect(() => {
    if (hidratado && sessao !== null) {
      router.replace(destino as Route);
    }
  }, [hidratado, sessao, destino, router]);

  if (!hidratado || sessao !== null) {
    return <FullScreenLoader label="Verificando sua sessão…" />;
  }

  const entrar = () => {
    setErro(null);
    setRedirecionando(true);
    try {
      useCases.auth.iniciarLogin.execute(destino);
    } catch (error) {
      setRedirecionando(false);
      setErro(authErrorMessage(error));
    }
  };

  return (
    <main className="flex min-h-dvh flex-col bg-apsen-white md:flex-row">
      <section
        aria-label="Apsen"
        className="flex items-center justify-center bg-apsen-login px-[24px] py-[32px] md:w-1/2 md:py-0"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- logo estática; versão negativa via filtro */}
        <img
          src="/brand/apsen-logo.png"
          alt="Apsen"
          className="h-[72px] w-auto brightness-0 invert md:h-[150px]"
        />
      </section>
      <section className="flex flex-1 items-center justify-center px-[24px] py-[40px] md:w-1/2 md:px-[48px]">
        <div className="w-full max-w-[460px]">
          <h1 className="text-[32px] leading-[1.15] font-extrabold text-apsen-login md:text-[44px]">
            Demand Intelligence
          </h1>
          <p className="mt-[28px] text-[20px] font-bold text-apsen-slate">Seja bem-vindo!</p>
          <p className="mt-[2px] text-[16px] text-apsen-slate-3">Vamos começar?</p>
          <p className="mt-[20px] text-[14px] text-apsen-slate-3">
            Você está acessando o ambiente de <strong>{ambiente}</strong>
          </p>
          <div aria-live="polite" className="mt-[16px] empty:hidden">
            {erro !== null && <Alert tone="error">{erro}</Alert>}
          </div>
          <button
            type="button"
            onClick={entrar}
            disabled={redirecionando}
            className="mt-[8px] inline-flex w-full cursor-pointer items-center justify-center gap-[8px] rounded-full bg-apsen-login px-[24px] py-[13px] text-[15px] font-semibold text-white transition hover:brightness-90 focus-ring disabled:cursor-wait disabled:opacity-70"
          >
            {redirecionando ? 'Redirecionando…' : 'Entrar com e-mail corporativo'}
            <span aria-hidden="true">🔑</span>
          </button>
          <p className="mt-[24px] text-[13px] text-apsen-muted">
            Deseja solicitar seu acesso ou teve algum problema? Entre em contato através do{' '}
            {suporteUrl === undefined ? (
              'Service-now'
            ) : (
              <a
                href={suporteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-apsen-login underline focus-ring"
              >
                Service-now
              </a>
            )}
            .
          </p>
        </div>
      </section>
    </main>
  );
}
