import Head from 'next/head'
import { ConnectKitButton } from 'connectkit'

export default function Home() {
  return (
    <div>
      <Head>
        <title>Supabase Chat</title>
        <meta name="description" content="Supabase Chat" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ConnectKitButton />
      <div className="flex items-center justify-center h-screen w-full">gm</div>
    </div>
  )
}
