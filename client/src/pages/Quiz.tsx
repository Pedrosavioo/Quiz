import { useEffect, useState } from "react";
import { useSocket } from "../contexts/socketContext";
import { useUser } from "../contexts/userContext";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import styled from "styled-components";
import { questionI, useQuestion } from "../contexts/questionsContext";
import Question from "../compoent/Question";
import UserPanel from "../compoent/UserPanel";
import LogoutIcon from "@mui/icons-material/Logout";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

const style = {
   position: "absolute" as "absolute",
   top: "50%",
   left: "50%",
   transform: "translate(-50%, -50%)",
   width: 400,
   borderRadius: "1rem",
   boxShadow: 24,
};

const SectionStyled = styled.section`
   width: 100vw;
   height: 100vh;
   background: linear-gradient(
      90deg,
      rgba(26, 26, 46, 1) 0%,
      rgba(15, 52, 96, 1) 74%,
      rgba(233, 69, 96, 1) 100%
   );
   display: flex;
   flex-direction: column;
   justify-content: center;
   align-items: center;
   padding-bottom: 5rem;
`;

const FormStyle = styled.form`
   width: 100%; /* Ajustado para 100% */
   padding: 1rem;
   border-radius: 1rem;
   background-color: var(--color1);
   color: white;
   display: flex;
   flex-direction: column;
   align-items: center;
   gap: 1rem;

   & p {
      padding: 1rem 0;
      text-transform: uppercase;
   }

   & input[type="text"] {
      width: 100%;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      outline: none;
      background: rgba(0, 0, 0, 0.05);
      border: 1px solid var(--color4);
      color: #ffffff;

      &:focus {
         border: 3px solid var(--color4);
      }
   }

   & div {
      margin-top: 0.5rem;
      width: 100%;

      & p {
         font-size: 0.8rem;
      }

      & label {
         margin-left: 0.5rem;
         margin-right: 1rem;
         cursor: pointer;
         font-size: 0.9rem;
      }

      & input {
         margin: 0.5rem 0.2rem;
         cursor: pointer;
      }

      & #input-true {
         accent-color: #27b627;

         &:checked + #label-true {
            color: #39c839;
         }
      }

      & #input-false {
         accent-color: var(--color4);

         &:checked + #label-false {
            color: var(--color4);
         }
      }
   }

   & button {
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      background-color: var(--color4);
      color: white;
      transition: 0.5s;

      &:hover {
         transform: scale(1.05);
         cursor: pointer;
      }
   }
`;

const QuestionsStyle = styled.section`
   width: 80vw;
   max-width: 700px;
   max-height: 60vh;
   min-height: 20vh;
   display: flex;
   flex-direction: column;
   align-items: center;
   background-color: var(--color3);
   box-shadow: 10px 10px 20px var(--color1);
   gap: 1rem;
   padding: 1rem;
   border-radius: 1rem 0 0 1rem;
   overflow-y: auto;

   &::-webkit-scrollbar {
      width: 8px;
   }

   &::-webkit-scrollbar-track {
      background: var(--color3);
   }

   &::-webkit-scrollbar-thumb {
      background-color: var(--color4);
      border-radius: 10px;
   }

   & p {
      color: white;
   }
`;

const DivQuizStyled = styled.div`
   display: flex;
   flex-direction: column;
   align-items: center;
   gap: 1rem;
   position: relative;

   & #ilustration {
      width: 60px;
      position: relative;
      position: absolute;
      right: -3rem;
      top: -4.8rem;
      transform: rotate(20deg);
   }

   & #create-question {
      padding: 0.5rem 1rem;
      border-radius: 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      cursor: pointer;
      background-color: var(--color5);
      color: white;
   }
`;

const ButtonLogout = styled.button`
   position: absolute;
   display: flex;
   justify-content: center;
   align-items: center;
   top: 1rem;
   left: 1rem;
   padding: 0.5rem 0.5rem 0.5rem 0.5rem;
   transform: rotate(180deg);
   border: none;
   color: white;
   background-color: var(--color4);
   border-radius: 50%;
   cursor: pointer;
`;

function Quiz() {
   const { username, setUsername, numberAvatar } = useUser();
   const { ws, setWs } = useSocket();
   const { questions, setQuestions, addQuestion } = useQuestion();

   // Modal
   const [open, setOpen] = useState(false);
   const handleOpen = () => setOpen(true);
   const handleClose = () => setOpen(false);

   function handleSubmitQuestion(event: React.FormEvent<HTMLFormElement>) {
      event.preventDefault();

      const formData = new FormData(event.currentTarget);

      const newQuestion: questionI = {
         id: Date.now(),
         user_created: username as string,
         number_avatar: numberAvatar as number,
         subject: formData.get("subject") as string,
         question: formData.get("question") as string,
         response: formData.get("response") as "true" | "false",
      };

      if (ws) {
         ws.send(
            JSON.stringify({ type: "submitQuestion", content: newQuestion })
         );

         const handleMessage = (event: MessageEvent) => {
            const data = JSON.parse(event.data);
            if (data.type === "responseQuestions") {
               addQuestion(data.content);
               setOpen(false); // Fecha o modal após adicionar a pergunta
               ws.removeEventListener("message", handleMessage); // Limpa o listener
            }
         };

         ws.addEventListener("message", handleMessage);
      }
   }

   function logout() {
      if (ws) {
         ws.send(JSON.stringify({ type: "logout", content: username }));

         const handleMessage = (event: MessageEvent) => {
            const data = JSON.parse(event.data);
            if (data.type === "left") {
               setWs(null);
               setUsername(null);
            }
         };

         ws.addEventListener("message", handleMessage);
      }
   }

   ws?.send(JSON.stringify({ type: "getQuestions" }));

   useEffect(() => {
      if (ws) {
         const handleMessage = (event: MessageEvent) => {
            const data = JSON.parse(event.data);

            // Se for a mensagem de que uma pergunta foi adicionada
            if (data.type === "questionAdd" && data.content) {
               addQuestion(data.content); // Adiciona a nova pergunta ao estado
            }

            // Se for a mensagem de todas as perguntas
            if (data.type === "responseQuestions" && data.content) {
               setQuestions(data.content); // Atualiza todas as perguntas
            }
         };

         ws.addEventListener("message", handleMessage);

         // Limpa o listener quando o componente desmontar
         return () => {
            ws.removeEventListener("message", handleMessage);
         };
      }
   }, [ws, addQuestion, setQuestions]);

   return (
      <SectionStyled>
         <UserPanel />
         <DivQuizStyled>
            <img src="/imgs/ilustration.png" id="ilustration" />
            <QuestionsStyle
               style={{ justifyContent: `${!questions?.length ?'center':'flex-start' }` }}
               id="questions"
            >
               {!questions?.length && <p>Sem perguntas criadas</p>}
               {questions?.map((q, index) => (
                  <Question
                     key={index}
                     id={q.id}
                     subject={q.subject}
                     question={q.question}
                     response={q.response}
                     number_avatar={q.number_avatar}
                     user_created={q.user_created}
                  />
               ))}
            </QuestionsStyle>
            <button onClick={handleOpen} id="create-question">
               <AddCircleOutlineIcon /> Criar pergunta
            </button>
            <Modal
               open={open}
               onClose={handleClose}
               aria-labelledby="modal-modal-title"
               aria-describedby="modal-modal-description"
            >
               <Box sx={style}>
                  <FormStyle onSubmit={handleSubmitQuestion}>
                     <p>Adicionar pergunta</p>
                     <input
                        type="text"
                        name="subject"
                        required
                        placeholder="Assunto (ex.: HTML)"
                     />
                     <input
                        type="text"
                        name="question"
                        required
                        placeholder="Pergunta"
                     />
                     <div>
                        <p>Resposta:</p>
                        <input
                           type="radio"
                           name="response"
                           id="input-true"
                           value="true"
                           required
                        />
                        <label htmlFor="input-true" id="label-true">
                           Verdadeiro
                        </label>
                        <input
                           type="radio"
                           name="response"
                           id="input-false"
                           value="false"
                           required
                        />
                        <label htmlFor="input-false" id="label-false">
                           Falso
                        </label>
                     </div>
                     <button type="submit">Adicionar</button>
                  </FormStyle>
               </Box>
            </Modal>
         </DivQuizStyled>
         <ButtonLogout onClick={logout} id="logout">
            <LogoutIcon />
         </ButtonLogout>
      </SectionStyled>
   );
}

export default Quiz;
