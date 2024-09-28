import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { Poppins } from 'next/font/google'
import { darkTheme, getDefaultConfig, lightTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'

const config = getDefaultConfig({
  appName: 'Nation3 Basic Income',
  projectId: 'YOUR_PROJECT_ID',
  chains: [mainnet, sepolia]
})

const queryClient = new QueryClient()

const poppins = Poppins({ subsets: ['latin'], weight: '400' })

export default function App({ Component, pageProps }: AppProps) {
  console.info('App')
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={{
          lightMode: lightTheme(),
          darkMode: darkTheme()
        }}>
          <main className={poppins.className}>
            <Component {...pageProps} />
          </main>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
