'use client'
import React, { useEffect, useState } from 'react'
import PlaygroundHeader from '../_components/PlaygroundHeader'
import ChatSection from '../_components/ChatSection'
import WebsiteDesgin from '../_components/WebsiteDesgin'
import ElementSettingSection from '../_components/ElementSettingSection'
import { useParams, useSearchParams } from 'next/navigation'
import axios from 'axios'

export type Frame = {
  projectId: string,
  frameId: number,
  designCode: string,
  chatMessages: Messages[]
}

export type Messages = {
  role: 'user' | 'assistant'
  content: string
}

const Prompt=`userInput: {userInput}
Create a simple, clean, and responsive website using HTML, CSS, and basic JavaScript.

Pages/Sections:
- Home (title, short description, button)
- About (few lines about the website or person)
- Services / Features (3 simple cards)
- Contact (basic contact form)

Design Requirements:
- Minimal layout
- Light color palette
- Easy-to-read fonts
- Mobile-friendly

Functionality:

- Navbar with smooth scrolling
- Hover effects on buttons
- Simple form validation using JavaScript

Generate complete, clean code with comments, suitable for beginners.
`

function PlayGround
() {
  const {projectId} = useParams();
  const params = useSearchParams();
  const frameId = params.get('frameId');
  const [frameDetail, setFrameDetail] = useState<Frame>();
  const [loading, setLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<Messages[]>([]);
  const [generatedCode, setGeneratedCode] = useState<any>();
  useEffect(()=>{
    frameId && GetFrameDetails();
  }, [frameId])
  
  const GetFrameDetails= async() => {
    const result = await axios.get('/api/frames?frameId='+frameId+"&projectId="+projectId);
    setFrameDetail(result.data);
    if(result.data?.chatMessages?.length==1)
    {
      const userMsg = result.data?.chatMessages[0].content;
      SendMessage(userMsg);
    }
  }

  const SendMessage = async (userInput:string) => {
    setLoading(true);
    setMessages((prev: any) => [
      ...prev,
      {role: 'user', content: userInput}
    ])

    const result = await fetch('/api/ai-model', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: "user", content: Prompt?.replace('{userInput}', userInput) }]
      })
    });
    
    const reader = result.body?.getReader();
    const decoder = new TextDecoder();

    let aiRespose = '';
    let isCode = false;

    while(true) {
      //@ts-ignore
      const {done, value} = await reader?.read();
      if (done) break;

      const chunk = decoder.decode(value,{stream:true});
      aiRespose+=chunk;

      if(!isCode && aiRespose.includes('```html')) {
        isCode = true;
        const index = aiRespose.indexOf("```html") + 7;
        const initialCodeChunk = aiRespose.slice(index);
        setGeneratedCode((prev:any)=> prev+initialCodeChunk);
      } else if(isCode) {
        setGeneratedCode((prev:any)=> prev+chunk);
      }
    }
    if(!isCode) {
        setMessages((prev: any) => [
          ...prev,
          { role: 'assistant', content: aiRespose}
        ])
      } else {
        setMessages((prev: any) => [
          ...prev,
          { role: 'assistant', content: 'Your code is ready!!'}
        ])
      }
    setLoading(false);
  }

  useEffect(() => {
    console.log(generatedCode);
  }, [generatedCode])
  return (
    <div>
        <PlaygroundHeader />
        <div className='flex'>
            <ChatSection messages={messages??[]}
            onSend={(input: string)=>SendMessage(input)}
            loading={loading}
            />
            <WebsiteDesgin />
            <ElementSettingSection />
        </div>
    </div>
  )
}

export default PlayGround
