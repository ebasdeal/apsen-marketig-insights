import type { Channel } from '@domain/campaign/Channel';
import { CHANNEL_LABELS } from '@presentation/format/labels';
import { CHANNEL_PILL_COLORS } from './channelColors';

const BASE =
  'inline-flex w-fit items-center whitespace-nowrap rounded-[10px] border px-[9px] py-[2px] text-[11.5px] font-semibold';

interface ChannelPillProps {
  channel: Channel;
}

export function ChannelPill({ channel }: ChannelPillProps) {
  return (
    <span data-channel={channel} className={`${BASE} ${CHANNEL_PILL_COLORS[channel]}`}>
      <span aria-hidden="true">{'● '}</span>
      <span>{CHANNEL_LABELS[channel]}</span>
    </span>
  );
}
