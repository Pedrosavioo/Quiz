import {
   Accordion,
   AccordionActions,
   AccordionDetails,
   AccordionSummary,
   Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useState } from "react";
import { useQuestion } from "../contexts/questionsContext";
import Avatar from "@mui/material/Avatar";
import styled from "styled-components";

interface propsI {
   id: number;
   subject: string;
   question: string;
   response: "true" | "false";
   number_avatar: number;
   user_created: string;
}

const DivSubjectStyle = styled.div`
   display: flex;
   flex-direction: column;
   margin-left: 1rem;

   & #subject {
      color: white;
      text-transform: uppercase;
   }

   & #user-created {
      font-size: 0.8rem;
      color: var(--color5);
      font-weight: bold;
   }
`;

// O componente Question agora aceita as props tipadas pela interface questionI
function Question({
   id,
   subject,
   question,
   response,
   number_avatar,
   user_created,
}: propsI) {
   const { addRightQuestion } = useQuestion();
   const [answered, setAnswered] = useState<boolean | null>(null); // Estado para acompanhar se a pergunta foi respondida corretamente ou não

   function verify(user_response: string) {
      const isCorrect = user_response === response;
      setAnswered(isCorrect); // Armazena se a resposta foi correta
      addRightQuestion(id, isCorrect); // Atualiza o contexto de perguntas
   }

   // Define a cor do fundo condicionalmente com base no estado da resposta
   const getBackgroundColor = () => {
      if (answered === true) return "#69d081bf";
      if (answered === false) return "#d0515c";
      return "var(--color1)";
   };

   const pathImage = `./imgs/user${number_avatar}.gif`;

   return (
      <div
         style={{
            width: "100%",
         }}
      >
         <Accordion
            style={{
               backgroundColor: getBackgroundColor(),
               width: "100%",
               boxShadow: '5px 5px 10px var(--color2)'
            }}
         >
            <AccordionSummary
               expandIcon={<ExpandMoreIcon style={{ color: "var(--color5)" }} />}
               aria-controls="panel3-content"
               id="panel3-header"
            >
               {/* Exibindo o assunto da pergunta */}
               <div
                  style={{
                     display: "flex",
                     flexDirection: "row",
                     justifyContent: "space-between",
                     alignItems: "center",
                  }}
               >
                  <Avatar alt="User image" src={pathImage} />
                  <DivSubjectStyle>
                     <p id="subject">{subject}</p>
                     <p id="user-created">{user_created}</p>
                  </DivSubjectStyle>
               </div>
            </AccordionSummary>
            <AccordionDetails
               style={{ background: "#16213e", margin: "0 .2rem " }}
            >
               {/* Exibindo a pergunta */}
               <p style={{ color: "white" }}>{question}</p>
            </AccordionDetails>
            <AccordionActions
               style={{ background: "#16213e", margin: "0 .2rem .2rem .2rem" }}
            >
               <Button
                  variant="contained"
                  color="success"
                  onClick={() => verify("true")}
                  disabled={answered !== null} // Desabilita os botões se já tiver respondido
               >
                  Verdadeiro
               </Button>
               <Button
                  variant="contained"
                  color="error"
                  onClick={() => verify("false")}
                  disabled={answered !== null} // Desabilita os botões se já tiver respondido
               >
                  Falso
               </Button>
            </AccordionActions>
         </Accordion>
      </div>
   );
}

export default Question;
