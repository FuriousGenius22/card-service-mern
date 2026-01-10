declare module 'crypto-icons' {
  import * as React from 'react';

  export interface CryptoIconProps {
    name: string;
    size?: number;
    format?: 'svg' | 'png' | string;
    className?: string;
  }

  export const CryptoIcon: React.FC<CryptoIconProps>;
}
