import { Tooltip } from '@presentation/components/ui';

export function SlugTip() {
  return (
    <Tooltip label="Sobre a chave interna (slug)">
      <strong>Identificador técnico único do tipo de driver.</strong> Usado internamente no{' '}
      <em>DriverRecord.tipo</em> e no pipeline de ingestão.
      <br />
      <br />
      Regras: letras minúsculas, sem espaços, sem acentos. Use underscore (_).
      <br />
      <br />
      <em>Ex:</em>
      <br />✓ sazo_epi
      <br />✓ falta_mp
      <br />✓ tv_aberta
      <br />✗ Sazonalidade Epidemiológica
      <br />✗ falta-MP
    </Tooltip>
  );
}

export function LabelTip() {
  return (
    <Tooltip label="Sobre o label no Driver Form">
      <strong>Texto exibido ao usuário no dropdown de tipo específico.</strong>
      <br />
      <br />
      Use emoji + nome descritivo para facilitar o reconhecimento visual:
      <br />
      <em>Ex:</em> 🌡️ Sazonal / Epidemiológico
      <br />
      <em>Ex:</em> ⚗️ Falta de Matéria-Prima / IFA
      <br />
      <br />
      Seja específico — o usuário não lê o slug, só vê este label.
    </Tooltip>
  );
}

export function DonoTip() {
  return (
    <Tooltip label="Sobre o dono de área">
      <strong>Área responsável por registrar e validar este tipo de driver.</strong>
      <br />
      <br />
      Define quem tem autoridade para confirmar que o evento ocorreu e qual foi o impacto real.
      <br />
      <br />
      <em>Ex:</em>
      <br />• TV / Digital → Marketing
      <br />• Falta de MP / Recall → Supply &amp; PCP
      <br />• Restrição ANVISA → Regulatório
      <br />• Ação de PDV → Comercial &amp; Trade
      <br />
      <br />
      Usuários com perfil <em>Área</em> só veem tipos cujo dono é o seu setor.
    </Tooltip>
  );
}

export function DescTip() {
  return (
    <Tooltip label="Sobre a descrição resumida">
      <strong>
        Texto explicativo exibido na tela do catálogo e no tooltip do tipo no Driver Form.
      </strong>
      <br />
      <br />
      Deve responder: <em>que tipo de evento é este? quando usar?</em>
      <br />
      <br />
      <em>Ex para sazo_epi:</em> &quot;Eventos sazonais e epidemiológicos que afetam a demanda
      ciclicamente — gripe, dengue, alergias, calor/frio extremo.&quot;
    </Tooltip>
  );
}

export function FeatureTip() {
  return (
    <Tooltip label="Sobre o tipo de feature gerada">
      <strong>
        Como o ApsenPLPEngine vai transformar este driver em variável exógena para o modelo.
      </strong>
      <br />
      <br />
      <em>Indicador simples 0/1:</em> variável binária — evento ativo (1) ou não (0). Mais simples.
      Use para eventos com início e fim claros.
      <br />
      <em>Ex:</em> feriado, campanha de TV de duração conhecida.
      <br />
      <br />
      <em>Variável numérica contínua:</em> variável numérica — ex: GRP para TV, nº de PDVs
      visitados, verba investida. Captura a intensidade, não só a presença.
      <br />
      <br />
      <em>Indicador defasado (lag):</em> o efeito aparece com atraso. Ex: campanha de TV tem efeito
      no mês seguinte (lag +1).
      <br />
      <br />
      <em>Indicador com decaimento:</em> o efeito cai progressivamente após o evento. Ex:
      viralização positiva — grande impacto no pico, reduz nas semanas seguintes.
      <br />
      <br />
      <em>Padrão sazonal recorrente:</em> captura padrão recorrente anual. Ex: gripe sempre no
      inverno — o modelo aprende o padrão histórico.
      <br />
      <br />
      <em>Demanda censurada:</em> ruptura ou recall não é queda real de demanda — é demanda não
      atendida. O modelo precisa tratar separado para não aprender que &quot;demanda cai em
      recall&quot;.
    </Tooltip>
  );
}

export function LagTip() {
  return (
    <Tooltip label="Sobre o lag padrão">
      <strong>Deslocamento temporal entre o evento e seu efeito na demanda.</strong>
      <br />
      <br />
      <em>Lag positivo (efeito posterior ao evento):</em>
      <br />
      +1 → campanha de TV leva ~1 mês para converter em venda
      <br />
      +2 → visita médica leva 2 meses para gerar prescrição
      <br />
      <br />
      <em>Lag negativo — lead (efeito anterior ao evento):</em>
      <br />
      -1 → reajuste de preço anunciado faz distribuidores antecipar compra 1 mês antes da vigência
      <br />
      <br />
      <em>0 → sem lag:</em> evento e efeito ocorrem no mesmo período. Use para ruptura logística,
      recall, sazonalidade climática.
      <br />
      <br />
      Este é o valor padrão — o analista pode ajustar por produto no momento da modelagem.
    </Tooltip>
  );
}

export function ImpactoTip() {
  return (
    <Tooltip label="Sobre o impacto esperado">
      <strong>Direção do efeito deste driver na demanda observada.</strong>
      <br />
      <br />↑ <em>Aumento:</em> campanha de TV, inclusão no RENAME, concorrente descontinuado
      <br />↓ <em>Redução / censura:</em> recall, falta de MP, restrição ANVISA — atenção: pode ser
      demanda censurada, não queda real
      <br />↕ <em>Ambos:</em> reajuste de preço (antecipação sobe, depois cai); mudança de
      distribuidor (gap e depois recuperação)
      <br />→ <em>Neutro / marcação temporal:</em> feriado longo — redistribui vendas entre dias,
      não altera volume total
      <br />
      <br />
      Esta informação ajuda o analista a validar se o sinal detectado na série está na direção
      esperada.
    </Tooltip>
  );
}

export function PermanenciaTip() {
  return (
    <Tooltip label="Sobre a permanência do efeito">
      <strong>Por quanto tempo o efeito do driver persiste na série após o fim do evento.</strong>
      <br />
      <br />
      <em>Temporário:</em> efeito cessa quando o evento termina. Ex: promoção de PDV — quando acaba,
      a demanda volta ao normal.
      <br />
      <br />
      <em>Residual:</em> efeito decai após o evento mas não zera imediatamente. Ex: campanha de TV —
      quando para de veicular, há memória de marca por algumas semanas.
      <br />
      <br />
      <em>Permanente / estrutural:</em> o nível da série muda de patamar para sempre. Ex: inclusão
      no RENAME (aumento permanente via SUS), concorrente descontinuado (ganho permanente de share),
      mudança de classificação Rx→OTC.
    </Tooltip>
  );
}

export function NotaTip() {
  return (
    <Tooltip label="Sobre a nota metodológica">
      <strong>
        Instrução técnica que aparece no payload JSON exportado para o pipeline de modelagem.
      </strong>
      <br />
      <br />
      Explique ao analista como tratar este tipo no modelo — especialmente casos não óbvios:
      <br />
      <br />
      <em>Ex para Recall:</em> &quot;Demanda censurada — a queda no sell-out não representa redução
      real de demanda. Usar flag_censored() no ApsenPLPEngine antes de modelar. Não inclua o período
      de recall no treino sem tratamento.&quot;
      <br />
      <br />
      <em>Ex para Push de sell-in:</em> &quot;Antecipação artificial de sell-in — modelar o período
      de digestão subsequente (sell-in abaixo do normal por N semanas). Não confundir com aumento
      real de demanda.&quot;
    </Tooltip>
  );
}
