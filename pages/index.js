import Head from 'next/head'
import { useState, useEffect, useRef } from 'react'
import { ConnectKitButton } from 'connectkit'
import { useAccount, useEnsName } from 'wagmi'
import { supabase } from '../utils/supabase'
import toast from 'react-hot-toast'

export default function Home() {
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState('')
  const inputRef = useRef(null)

  const { address } = useAccount()
  const { data: ensName } = useEnsName({
    address: address,
    chainId: 1,
  })

  useEffect(() => {
    console.log('address', address)
    console.log('ensName', ensName)
  }, [address])

  useEffect(() => {
    getMessages()

    const mySubscription = supabase
      .from('messages')
      .on('*', (payload) => {
        console.log(payload)
        getMessages()
      })
      .subscribe()

    return () => supabase.removeSubscription(mySubscription)
  }, [])

  const getMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select()
      .range(0, 49)
      .order('id', { ascending: false })

    if (error) {
      console.log(error)
      return
    }
    setMessages(data)
  }

  const sendMessage = async () => {
    if (!message) {
      return
    }

    if (!address) {
      console.log('test')
      toast('Connect wallet to continue.', {
        icon: '🦊',
      })

      return
    }

    setMessage('')
    const { error } = await supabase.from('messages').insert([
      {
        sender: ensName || address,
        content: message,
      },
    ])
    console.log('insert')

    if (error) console.log(error)
  }

  return (
    <div>
      <Head>
        <title>Supabase Chat</title>
        <meta name="description" content="Supabase Chat" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container mx-auto">
        <div className="flex items-center justify-center text-sm mx-4 pt-40">
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-lime-500 rounded-md blur opacity-75"></div>
            <div
              className="mockup-code w-full md:w-[600px] bg-black"
              onClick={() => inputRef.current.focus()}
            >
              <div className="flex flex-col-reverse h-[300px] overflow-y-auto no-scrollbar">
                {messages.map((message) => (
                  <div key={message.id}>
                    <pre data-prefix="$">
                      <span className="text-zinc-400">{message.sender}:</span> {message.content}
                    </pre>
                    {/* <pre data-prefix="$">{message.timestamp}</pre> */}
                  </div>
                ))}
              </div>
              <pre data-prefix="$">
                <input
                  ref={inputRef}
                  className="bg-transparent md:w-[530px] focus:outline-none"
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => {
                    e.key === 'Enter' && sendMessage()
                  }}
                  maxLength={70}
                />
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
