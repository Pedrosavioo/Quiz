import React, {
   ReactNode,
   createContext,
   useContext,
   useEffect,
   useState,
} from "react";
import { useSocket } from "./socketContext";
import { useUser } from "./userContext";

export interface questionI {
   id: number;
   user_created: string;
   number_avatar: number;
   subject: string;
   question: string;
   response: "true" | "false";
   right?: boolean;
}

interface IQuestionContextType {
   questions: questionI[] | null;
   setQuestions: (questions: questionI[] | null) => void;
   addQuestion: (question: questionI) => void;
   addRightQuestion: (id: number, right: boolean) => void;
}

const QuestionContext = createContext<IQuestionContextType | undefined>(
   undefined
);

export const QuestionProvider: React.FC<{ children: ReactNode }> = ({
   children,
}) => {
   const [questions, setQuestions] = useState<questionI[] | null>(null);

   const { ws } = useSocket();
   const { username } = useUser();
   useEffect(() => {
      if (ws) {
         ws.send(JSON.stringify({ type: "getQuestions", owner: username }));
         ws.onmessage = (event: MessageEvent) => {
            const data = JSON.parse(event.data);

            console.log(data);
            setQuestions(data);
         };
      }
   }, []);

   function addQuestion(question: questionI) {
      if (questions) {
         setQuestions([...questions, question]);
      } else {
         setQuestions([question]);
      }
   }

   function addRightQuestion(id: number, right: boolean) {
      const updatedQuestions = questions?.map((quest) => {
         if (quest.id === id) {
            return {
               ...quest,
               right: right,
            };
         }
         return quest;
      });

      setQuestions(updatedQuestions || null);
   }

   return (
      <QuestionContext.Provider
         value={{ questions, setQuestions, addQuestion, addRightQuestion }}
      >
         {children}
      </QuestionContext.Provider>
   );
};

export const useQuestion = (): IQuestionContextType => {
   const context = useContext(QuestionContext);
   if (!context) {
      throw new Error("Context is type undefined");
   }
   return context;
};
