'use client'
import React from 'react'
import { Messages } from '../[projectId]/page'

type Props = {
  messages: Messages[]
}

function ChatSection({ messages }: Props) {
  return (
    <div className='w-96 shadow h-[90vh] p-4 flex flex-col'>
      <div className='flex-1 overflow-y-auto space-y-3 flex flex-col'>
        {messages.length === 0 ? (
          <p className='text-gray-500 text-center'>No Messages Yet</p>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`p-2 rounded-lg max-w-[80%] ${
                  msg.role === 'user'
                    ? 'bg-gray-100 text-black'
                    : 'bg-gray-300 text-black'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default ChatSection
