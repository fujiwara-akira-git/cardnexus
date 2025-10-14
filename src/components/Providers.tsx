'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider
      // エラーが発生した場合のハンドリング
      refetchInterval={5 * 60} // 5分ごとにセッションを更新
      refetchOnWindowFocus={true}
    >
      {children}
    </SessionProvider>
  )
}