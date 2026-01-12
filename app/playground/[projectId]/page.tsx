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

  useEffect(()=>{
    frameId && GetFrameDetails();
  }, [frameId])
  
  const GetFrameDetails= async() => {
    const result = await axios.get('/api/frames?frameId='+frameId+"&projectId="+projectId);
    console.log('API RESULT:', result.data)
  console.log('API MESSAGES:', result.data.messages)
    setFrameDetail(result.data);
  }
  return (
    <div>
        <PlaygroundHeader />
        <div className='flex'>
            <ChatSection messages={frameDetail?.chatMessages??[]}/>
            <WebsiteDesgin />
            <ElementSettingSection />
        </div>
    </div>
  )
}

export default PlayGround
