export function PermissionCheck({ value }: { value: boolean }) {
  return value ? (
    <span className="text-[15px] text-apsen-green">
      <span aria-hidden="true">✓</span>
      <span className="sr-only">Sim</span>
    </span>
  ) : (
    <span className="text-[13px] text-apsen-muted-2">
      <span aria-hidden="true">—</span>
      <span className="sr-only">Não</span>
    </span>
  );
}
