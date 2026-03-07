import { Tag } from 'antd';
import { MembershipTier } from '@/types/customer.types';

interface Props {
  tier: MembershipTier;
  className?: string;
}

export const MembershipTierBadge = ({ tier, className }: Props) => {
  const getTierConfig = (tier: MembershipTier) => {
    switch (tier) {
      case 'vip':
        return {
          color: 'purple',
          label: 'VIP',
          style: {
            background: 'linear-gradient(90deg, #b01eff 0%, #e1467c 100%)',
            color: 'white',
            border: 'none',
            fontWeight: 600,
          },
        };
      case 'gold':
        return {
          color: 'gold',
          label: 'Gold',
          style: {
            background: 'linear-gradient(90deg, #f6d365 0%, #fda085 100%)',
            color: 'white',
            border: 'none',
            fontWeight: 600,
          },
        };
      case 'silver':
        return {
          color: 'default',
          label: 'Silver',
          style: {
            background: 'linear-gradient(90deg, #e6e9f0 0%, #eef1f5 100%)',
            color: '#475569',
            border: '1px solid #cbd5e1',
            fontWeight: 600,
          },
        };
      case 'regular':
      default:
        return {
          color: 'default',
          label: 'Regular',
          style: {
            fontWeight: 500,
          },
        };
    }
  };

  const config = getTierConfig(tier);

  return (
    <Tag className={className} style={config.style} color={config.color}>
      {config.label}
    </Tag>
  );
};
