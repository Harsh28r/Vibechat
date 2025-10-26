import { createContext, useContext } from 'react'

const SocketContext = createContext(null)

export const useSocket = () => {
  const socket = useContext(SocketContext)
  if (!socket) {
    throw new Error('useSocket must be used within SocketProvider')
  }
  return socket
}

export const SocketProvider = ({ socket, children }) => {
  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  )
}

