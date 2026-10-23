import type { Channel } from '@domain/campaign/Channel';

export const CHANNEL_PILL_COLORS: Record<Channel, string> = {
  google: 'text-apsen-ch-google bg-apsen-ch-google/[9.4%] border-apsen-ch-google/[18.8%]',
  meta: 'text-apsen-ch-meta bg-apsen-ch-meta/[9.4%] border-apsen-ch-meta/[18.8%]',
  linkedin: 'text-apsen-ch-linkedin bg-apsen-ch-linkedin/[9.4%] border-apsen-ch-linkedin/[18.8%]',
  email: 'text-apsen-ch-email bg-apsen-ch-email/[9.4%] border-apsen-ch-email/[18.8%]',
  tiktok: 'text-apsen-ch-tiktok bg-apsen-ch-tiktok/[9.4%] border-apsen-ch-tiktok/[18.8%]',
};

export const CHANNEL_FILL_COLORS: Record<Channel, string> = {
  google: 'bg-apsen-ch-google',
  meta: 'bg-apsen-ch-meta',
  linkedin: 'bg-apsen-ch-linkedin',
  email: 'bg-apsen-ch-email',
  tiktok: 'bg-apsen-ch-tiktok',
};
