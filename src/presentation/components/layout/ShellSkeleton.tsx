import Image from 'next/image';
import { ApsenLoader } from '../ui/ApsenLoader';

export function ShellSkeleton({ label }: { label: string }) {
  return (
    <>
      <aside
        aria-hidden
        className="fixed top-0 left-0 z-30 flex h-screen w-sidebar flex-col border-r border-apsen-border bg-apsen-white max-[800px]:hidden"
      >
        <div className="flex h-topbar shrink-0 items-center gap-[10px] border-b border-apsen-border px-[18px]">
          <Image
            src="/brand/apsen-logo.png"
            alt=""
            width={124}
            height={96}
            preload
            className="h-[34px] w-auto shrink-0 dark:brightness-0 dark:invert"
          />
        </div>
      </aside>
      <header
        aria-hidden
        className="fixed top-0 right-0 left-sidebar z-20 h-topbar border-b border-apsen-border bg-apsen-white max-[800px]:left-0"
      />
      <main className="mt-topbar ml-sidebar h-[calc(100vh-var(--spacing-topbar))] overflow-y-auto px-[24px] py-[22px] max-[800px]:ml-0">
        <ApsenLoader variant="content" label={label} />
      </main>
    </>
  );
}
