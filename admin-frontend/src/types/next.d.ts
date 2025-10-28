import type { NextPage } from 'next';
import type { ReactElement, ReactNode } from 'react';

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

export interface ListOrdersQueryDto {
  page?: number;
  limit?: number;
  status?: string;
  q?: string;
}

export interface UpdateOrderStatusDto {
  status: string;
}
