import { useEffect, useState } from "react";
import { useSocket } from "../contexts/socketContext";
import { useUser } from "../contexts/userContext";
import styled from "styled-components";

const image_background = "./imgs/background.jpg";

const DivLogin = styled.div`
   width: 100vw;
   height: 100vh;
   display: flex;
   flex-direction: column;
   justify-content: center;
   align-items: center;
   background-image: url(${image_background});
   background-size: 100vw 100vh;

   & img {
      width: 300px;
      position: absolute;
      top: 100px;
      transition: 0.5s;

      &:hover {
         transform: scale(1.05);
      }
   }

   & form {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2rem;

      & input {
         font-size: 1.3rem;
         background-color: rgba(0, 0, 0, 0);
         padding: 1rem 3rem 1rem 1rem;
         border: 1px solid var(--color4);
         color: white;
         border-radius: 1rem;
         outline: none;
         transition: 0.2s;

         &:hover {
            transform: scale(1.01);
         }

         &:focus {
            border: 3px solid var(--color4);
         }
      }

      & button {
         background-color: var(--color4);
         color: white;
         padding: 0.5rem 2rem;
         border-radius: 1rem;
         font-size: 1.3rem;
         outline: none;
         cursor: pointer;

         &:hover {
            background: var(--color5);
         }
      }
   }
`;

export default function Login() {
   const { ws, setWs, error, setError } = useSocket();
   const { setUsername, addAvatar } = useUser();
   const [value, setValue] = useState("");

   function setValueInput(e: React.ChangeEvent<HTMLInputElement>) {
      setValue(e.target.value);
   }

   function login(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();

      if (ws) {
         ws.send(JSON.stringify({ type: "login", content: value }));
      }

      if (!ws) {
         const socket = new WebSocket("ws://localhost:3001");
         setWs(socket);
      }
   }

   useEffect(() => {
      if (ws) {
         const handleMessage = (event: MessageEvent) => {
            const data = JSON.parse(event.data);

            if (data.type === "Error") {
               console.log("usuário duplicado");
               setError(data.content);
            }

            if (data.type === "joined") {
               setError(null);
               console.log("usuário logou com sucesso!");
               setUsername(value);
               addAvatar();
            }
         };

         ws.addEventListener("message", handleMessage);

         return () => {
            ws.removeEventListener("message", handleMessage); // Limpa o listener ao desmontar
         };
      }
   }, [ws, value, setUsername, setError]);

   const imgIcon = "./../../imgs/icon-quiz.webp";

   return (
      <DivLogin>
         <img src={imgIcon} alt="Image Quiz" />
         <form onSubmit={login}>
            <input
               type="text"
               placeholder="username"
               onChange={setValueInput}
            />
            <button type="submit">Login</button>
            {error && <span style={{ color: "white" }}>{error}</span>}
         </form>
      </DivLogin>
   );
}
