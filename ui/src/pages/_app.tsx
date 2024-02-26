import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { Poppins } from 'next/font/google'

import { WagmiConfig, createConfig, configureChains, mainnet } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
 
const { chains, publicClient } = configureChains(
  [mainnet],
  [publicProvider()]
)

const config = createConfig({
  autoConnect: true,
  publicClient
})

const poppins = Poppins({ subsets: ['latin'], weight: '400' })

export default function App({ Component, pageProps }: AppProps) {
  console.info('App')
  return (
    <WagmiConfig config={config}>
      <main className={poppins.className}>
        <Component {...pageProps} />
      </main>
    </WagmiConfig>
  )
}
