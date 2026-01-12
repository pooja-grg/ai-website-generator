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
        messages: [...messages, { role: "user", content: userInput }]
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
  return (
    <div>
        <PlaygroundHeader />
        <div className='flex'>
            <ChatSection messages={messages??[]}
            onSend={(input: string)=>SendMessage(input)}
            />
            <WebsiteDesgin />
            <ElementSettingSection />
        </div>
    </div>
  )
}

export default PlayGround
