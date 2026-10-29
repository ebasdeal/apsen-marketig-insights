import { Tooltip } from '@presentation/components/ui';
import type { ReactNode } from 'react';

const CONTEUDOS = {
  titulo: (
    <>
      <strong>Nome descritivo para identificar o driver na lista de registros.</strong>
      <br />
      <br />
      <em>Boas práticas:</em>
      <br />✓ Campanha TV Inverno Globo Jul/2026
      <br />✓ Falta IFA Baricitinibe — Fornecedor Lilly Jun/2026
      <br />✓ Restrição ANVISA RDC 212/2026
      <br />
      <br />✗ Evite: &quot;Campanha&quot;, &quot;Problema&quot;, &quot;Evento&quot; — sem contexto
      temporal ou de produto.
    </>
  ),
  inicio: (
    <>
      <strong>Data em que o evento começa a ter efeito na demanda</strong> — não necessariamente
      quando foi anunciado.
      <br />
      <br />
      <em>Ex TV:</em> campanha vai ao ar no dia 10/07 → data início = 10/07
      <br />
      <em>Ex MP:</em> falta de IFA confirmada em 15/06 → data início = 15/06
      <br />
      <em>Ex Reajuste de preço:</em> vigência a partir de 01/08 → data início = 01/08
      <br />
      <br />
      Para campanhas com lead de efeito (o modelo antecipa o comportamento), o analista pode ajustar
      o lag na modelagem — não antecipe a data aqui.
    </>
  ),
  fim: (
    <>
      <strong>Data em que o efeito do evento cessa</strong> (opcional).
      <br />
      <br />
      Em branco, vale 1 ano a partir da data início. O fim nunca passa de 1 ano da data início.
      <br />
      <br />A permanência do efeito (ex: mudança de classificação Rx→OTC, concorrente descontinuado)
      vem da configuração do tipo de driver, não da data fim.
    </>
  ),
  franquia: (
    <>
      <strong>Franquia</strong> é a linha terapêutica completa — todos os produtos de uma área.
      <br />
      <br />
      <em>Quando usar:</em> o driver afeta toda uma área terapêutica.
      <br />
      <em>Ex:</em> campanha institucional de Cardiologia, mudança regulatória que impacta toda a
      linha de Imunologia.
    </>
  ),
  familia: (
    <>
      <strong>Molécula</strong> é o princípio ativo — a substância que produz o efeito terapêutico.
      <br />
      <br />
      <em>Quando usar este modo:</em> quando o driver afeta todos os medicamentos que contêm aquela
      substância, independente da dosagem ou apresentação.
      <br />
      <br />
      <em>Ex:</em> uma restrição regulatória da ANVISA sobre Baricitinibe impacta o 2mg e o 4mg ao
      mesmo tempo. A IA identifica automaticamente quais SKUs têm essa molécula na composição.
    </>
  ),
  sku: (
    <>
      <strong>SKU</strong> (Stock Keeping Unit) é o código único de cada apresentação do
      medicamento.
      <br />
      <br />
      <em>Ex:</em> Baricitinibe 2mg Blister 28cp = SKU-00312
      <br />
      Baricitinibe 4mg Blister 28cp = SKU-00313
      <br />
      <br />
      Selecione o SKU mais específico afetado pelo driver. Se o evento impacta toda a molécula, use
      o modo <em>Por Molécula</em>.
    </>
  ),
  categoria: (
    <>
      <strong>Agrupa o driver por natureza do evento</strong> para facilitar a modelagem causal.
      <br />
      <br />
      <em>Exemplos:</em>
      <br />
      📡 <em>Mídia:</em> TV, rádio, digital, outdoor
      <br />
      🛒 <em>Comercial:</em> ação PDV, visita médica, desconto
      <br />
      ⚙️ <em>Supply:</em> falta de MP, recall, reprovação de lote
      <br />
      📋 <em>Regulatório:</em> ANVISA, CMED, RENAME
      <br />
      🌡️ <em>Sazonalidade:</em> gripe, dengue, calendário
      <br />
      <br />A categoria define os tipos disponíveis no campo abaixo.
    </>
  ),
  tipo: (
    <>
      <strong>Define exatamente que tipo de evento é este driver</strong> e quais campos adicionais
      serão solicitados.
      <br />
      <br />O tipo determina também como o <em>ApsenPLPEngine</em> vai transformar este driver em
      variável exógena para o modelo:
      <br />• TV → variável numérica com GRP
      <br />• Falta de MP → indicador de demanda censurada
      <br />• Recall → indicador de demanda censurada
      <br />• Sazonalidade → padrão recorrente de Fourier
      <br />• Viral → indicador agudo com decaimento
    </>
  ),
  regioes: (
    <>
      <strong>Onde o evento tem efeito geográfico.</strong>
      <br />
      <br />
      Impacta como o modelo trata a série: um evento regional deve ser modelado apenas na série
      regional, não na nacional.
      <br />
      <br />
      <em>Dica:</em> se nacional mas com intensidade maior no Sudeste, selecione Nacional mesmo
      assim — o analista pondera na modelagem.
    </>
  ),
  canal: (
    <>
      <strong>Canal de distribuição/venda afetado pelo driver.</strong>
      <br />
      <br />• <em>Farmácias:</em> sell-out varejo
      <br />• <em>Hospitalar:</em> licitações institucionais
      <br />• <em>Governo/Licitação:</em> RENAME, Farmácia Popular, CEAF
    </>
  ),
  intensidade: (
    <>
      <strong>Estimativa do impacto na demanda (1 baixa → 5 muito alta).</strong>
      <br />
      <br />⚡ 1 — marginal, difícil detectar
      <br />
      ⚡⚡ 2 — variação até ~5%
      <br />
      ⚡⚡⚡ 3 — variação visível ~10–15%
      <br />
      ⚡⚡⚡⚡ 4 — distorção clara &gt;15%
      <br />
      ⚡⚡⚡⚡⚡ 5 — ruptura ou pico expressivo
    </>
  ),
  uplift: (
    <>
      <strong>Aumento percentual esperado sobre a demanda base (baseline).</strong>
      <br />
      <br />
      É preenchido automaticamente pela intensidade, mas você pode ajustar para o valor específico
      deste driver.
      <br />
      <br />
      <em>Ex:</em> uplift de +15% significa que a demanda esperada é 15% maior que seria sem este
      driver.
      <br />
      <br />
      Adimensional — funciona igual para qualquer SKU, independente do volume.
    </>
  ),
  verba: (
    <>
      <strong>Valor total investido (opcional).</strong>
      <br />
      <br />
      Útil para modelos de Marketing Mix Modeling (MMM).
      <br />
      Para eventos não financeiros deixe em branco.
    </>
  ),
  observacoes: (
    <>
      <strong>Campo livre para contexto adicional.</strong>
      <br />
      <br />• Lag estimado: &quot;efeito esperado ~3 semanas após veiculação&quot;
      <br />• Antecipação: &quot;distribuidores devem antecipar pedidos antes do reajuste&quot;
      <br />• Ressalvas: &quot;campanha cancelada na semana 2&quot;
    </>
  ),
} satisfies Record<string, ReactNode>;

export type DriverTip = keyof typeof CONTEUDOS;

export function DriverTooltip({ tip, rotulo }: { tip: DriverTip; rotulo: string }) {
  return <Tooltip label={`Ajuda: ${rotulo}`}>{CONTEUDOS[tip]}</Tooltip>;
}
