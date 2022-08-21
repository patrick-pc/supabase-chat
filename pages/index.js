import Head from 'next/head'
import { useState, useEffect } from 'react'
import { ConnectKitButton } from 'connectkit'
import { useAccount, useEnsName } from 'wagmi'
import { supabase } from '../utils/supabase'
import toast from 'react-hot-toast'

export default function Home() {
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState('')

  const { address } = useAccount()
  const { data: ensName } = useEnsName({
    address: address,
    chainId: 1,
  })

  // Check wallet address
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

    if (error) {
      console.log(error)
      return
    }
  }

  return (
    <div>
      <Head>
        <title>Supabase Chat</title>
        <meta name="description" content="Supabase Chat" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex flex-col items-center justify-between h-[600px]">
        <div className="flex flex-col-reverse overflow-y-auto">
          {messages.map((message) => (
            <div key={message.id}>
              <p>{message.id}</p>
              <p>{message.sender}</p>
              <p>{message.content}</p>
              <p>{message.timestamp}</p>
            </div>
          ))}
        </div>
        <div>
          <input
            className="border"
            type="text"
            placeholder="Type your message here"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              e.key === 'Enter' && sendMessage()
            }}
            maxLength={30}
          />
          <button onClick={sendMessage}>Send Message</button>
        </div>
      </div>
    </div>
  )
}
