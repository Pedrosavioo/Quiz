import React, {
   ReactNode,
   createContext,
   useContext,
   useEffect,
   useState,
} from "react";
import { useUser } from "./userContext";

export interface IMessage {
   owner?: string;
   type: string;
   content: string;
   username: string | undefined;
}

interface responseSocket extends WebSocket {
   username: string | undefined;
}

interface ISocketContextType {
   ws: WebSocket | null;
   setWs: (web_socket: WebSocket | null) => void;
   response: responseSocket | null;
   error: string | null;
   setError: (error: string | null) => void;
}

const SocketContext = createContext<ISocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: ReactNode }> = ({
   children,
}) => {
   const [ws, setWs] = useState<WebSocket | null>(null);
   const [response, setResponse] = useState<responseSocket | null>(null);
   const [error, setError] = useState<string | null>(null);
   const [isConnected, setIsConnected] = useState<boolean>(false);

   useEffect(() => {
      const socket = new WebSocket("ws://localhost:3001");

      socket.onopen = () => {
         console.log("Conectado ao servidor WebSocket");
         setWs(socket);
         setIsConnected(true);

      };

      socket.onclose = () => {
         console.log("Desconectado do servidor WebSocket");
         setIsConnected(false);
      };

      socket.onerror = (err) => {
         console.error("Erro no WebSocket", err);
         setError("Erro de conexão ao servidor WebSocket");
      };

      socket.onmessage = (event: MessageEvent) => {
         const data = JSON.parse(event.data);
         setResponse(data); // Armazena a mensagem recebida
      };

      return () => {
         console.log("conexão encerrada");
         socket.close(); // Limpa a conexão quando o componente é desmontado
      };
   }, []);

   return (
      <SocketContext.Provider value={{ ws, setWs, response, error, setError }}>
         {children}
      </SocketContext.Provider>
   );
};

export const useSocket = (): ISocketContextType => {
   const context = useContext(SocketContext);
   if (!context) {
      throw new Error("Context is type undefined");
   }
   return context;
};
