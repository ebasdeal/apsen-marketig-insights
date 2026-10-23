import { CHANNELS } from '@domain/campaign/Channel';
import { CHANNEL_LABELS } from '@presentation/format/labels';
import { render, screen } from '@testing-library/react';
import { CHANNEL_FILL_COLORS } from '../channelColors';
import { ChannelPill } from '../ChannelPill';

describe('ChannelPill', () => {
  it.each(CHANNELS)('exibe o canal %s com a cor da paleta', (channel) => {
    render(<ChannelPill channel={channel} />);
    const pill = screen.getByText(CHANNEL_LABELS[channel]).parentElement as HTMLElement;
    expect(pill).toHaveAttribute('data-channel', channel);
    expect(pill).toHaveClass(`text-apsen-ch-${channel}`, 'rounded-[10px]', 'text-[11.5px]');
    expect(pill.firstElementChild).toHaveAttribute('aria-hidden', 'true');
    expect(pill.textContent).toBe(`● ${CHANNEL_LABELS[channel]}`);
  });

  it('expõe as cores de preenchimento por canal', () => {
    expect(CHANNELS.map((channel) => CHANNEL_FILL_COLORS[channel])).toEqual(
      CHANNELS.map((channel) => `bg-apsen-ch-${channel}`),
    );
  });
});
