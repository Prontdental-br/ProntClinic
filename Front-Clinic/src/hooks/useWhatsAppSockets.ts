// useWhatsappSocket.ts (hook customizado)
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export function useWhatsappSocket(accountId: string, onNewMessage: (msg: any) => void) {
  const socketRef = useRef<Socket>();

  useEffect(() => {
    if (!accountId) return;

    const socket = io(process.env.NEXT_PUBLIC_API_BASE_URL!, {
      query: { accountId },
      transports: ['websocket'],
      timeout: 5000,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 500,
      reconnectionDelayMax: 2000,
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log(`Conectado à sala do schema: ${accountId}`);
    });

    socket.on('new-message', (message) => {
      console.log('Nova mensagem recebida:', message);
      onNewMessage(message);
    });

   

    socket.on('disconnect', () => {
      console.log(`Desconectado do WebSocket: ${accountId}`);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [accountId]);
}
