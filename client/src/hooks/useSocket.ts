import { useEffect, useRef, useState } from 'react';

interface SocketMessage {
  type: string;
  [key: string]: any;
}

interface UseSocketOptions {
  clientId?: string;
  onMessage?: (message: SocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function useSocket(options: UseSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<SocketMessage | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const { clientId, onMessage, onConnect, onDisconnect } = options;

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws${clientId ? `?clientId=${clientId}` : ''}`;
    
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
      onConnect?.();
    };

    socket.onclose = () => {
      setIsConnected(false);
      onDisconnect?.();
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        setLastMessage(message);
        onMessage?.(message);
      } catch (error) {
        console.error('Failed to parse socket message:', error);
      }
    };

    socket.onerror = (error) => {
      console.error('Socket error:', error);
    };

    return () => {
      socket.close();
    };
  }, [clientId, onMessage, onConnect, onDisconnect]);

  const sendMessage = (message: SocketMessage) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    }
  };

  return {
    isConnected,
    lastMessage,
    sendMessage
  };
}
