import Image from 'next/image'
import flag from '../../public/flag.svg'
import solarpunk from '../../public/solarpunk.jpg'
import Menu from '@/components/Menu'
import Link from 'next/link'
import LoadingIndicator from '@/components/LoadingIndicator'
import { config } from '@/utils/Config'

export default function Home() {
  console.log('Home')
  return (
    <main className='flex-column lg:flex'>
      <Menu />

      <div className='w-full lg:w-3/4 p-8'>
        <h1 className="text-3xl font-bold flex">
          Nation3 Basic Income (N3BI)&nbsp;
          <Image src={flag} width={36} height={36} alt='Nation3 Flag' />
        </h1>

        <div className='mt-4'>
          Eligibility:
          <ol className="list-decimal ml-6">
            <li>The account owns a passport NFT</li>
            <li>The passport has not expired</li>
            <li>The passport is not about to expire within the next year</li>
            <li>The citizen is <Link target='_blank' className="font-bold text-transparent bg-clip-text bg-gradient-to-br from-sky-400 to-green-400" href={"https://github.com/nation3/nationcred-datasets/tree/main/nationcred#definition-of-active"}>active</Link></li>
          </ol>
        </div>

        <div className='mt-4'>
          <Image src={solarpunk} width={0} height={0} className='rounded-2xl' />
        </div>
      </div>
    </main>
  )
}
