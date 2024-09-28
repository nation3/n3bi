import '@rainbow-me/rainbowkit/styles.css';
import Head from 'next/head'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export default function WalletMenu() {
    console.log('WalletMenu')
    return (
        <div className='flex justify-end'>
            <ConnectButton />
        </div>
    )
}
