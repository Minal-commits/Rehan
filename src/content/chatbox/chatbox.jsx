import React from 'react'

const ChatBox = () => {
  return (
    <div className='fixed bottom-5 right-5 w-[350px] h-[450px] bg-white rounded z-[9999] overflow-hidden flex' >
      <div className='w-full h-[50px] bg-[#1a5ce6] px-2 justify-between flex flex-col items-start'>
        <p className='text-lg font-semibold text-white'>Luna AI</p>
        <p>❌</p>
      </div>
    </div>
  )
}

export default ChatBox