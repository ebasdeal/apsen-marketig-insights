import { Tooltip } from '@presentation/components/ui';

export function TipoSlugHeader() {
  return (
    <>
      Tipo / Slug
      <Tooltip label="Sobre Tipo / Slug">
        <strong>Label</strong> exibido no Driver Form e <strong>slug</strong> técnico usado no
        DriverRecord.tipo
      </Tooltip>
    </>
  );
}

export function FeatureHeader() {
  return (
    <>
      Feature Engineering
      <Tooltip label="Sobre Feature Engineering">
        <strong>Método de transformação do driver em variável exógena</strong> para o
        ApsenPLPEngine.
        <br />
        <br />
        indicador = binária 0/1
        <br />
        continua = numérica (GRP, verba)
        <br />
        censored = ruptura/recall (demanda mascarada)
        <br />
        fourier_sazo = sazonalidade recorrente
        <br />
        permanente = mudança estrutural irreversível
      </Tooltip>
    </>
  );
}

export function LagHeader() {
  return (
    <>
      Lag
      <Tooltip label="Sobre Lag">
        <strong>Deslocamento temporal padrão (meses)</strong> entre o evento e seu efeito na
        demanda.
        <br />0 = efeito imediato
        <br />
        +1 = efeito 1 mês depois
        <br />
        -1 = antecipação (lead)
      </Tooltip>
    </>
  );
}

export function CamposHeader() {
  return (
    <>
      Campos
      <Tooltip label="Sobre Campos">
        <strong>Nº de parâmetros específicos</strong> do formulário para este tipo.
        <br />
        Mais campos = mais contexto para o analista.
      </Tooltip>
    </>
  );
}
