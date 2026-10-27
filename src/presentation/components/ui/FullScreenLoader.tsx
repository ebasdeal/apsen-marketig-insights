import Image from 'next/image';

interface FullScreenLoaderProps {
  label: string;
}

export function FullScreenLoader({ label }: FullScreenLoaderProps) {
  return (
    <div
      role="status"
      className="fixed inset-0 z-[9000] flex flex-col items-center justify-center gap-[18px] bg-apsen-bg"
    >
      <Image
        src="/brand/apsen-logo.png"
        alt=""
        aria-hidden
        width={124}
        height={96}
        preload
        data-testid="loader-logo"
        className="h-[56px] w-auto motion-safe:animate-pulse dark:brightness-0 dark:invert"
      />
      <span
        aria-hidden
        data-testid="loader-spinner"
        className="size-[28px] rounded-full border-[3px] border-apsen-blue-light border-t-apsen-blue motion-safe:animate-spin"
      />
      <p className="text-[13px] font-medium text-apsen-muted">{label}</p>
    </div>
  );
}
