import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { SocketProvider } from "./contexts/socketContext";
import { UserProvider } from "./contexts/userContext";
import { QuestionProvider } from "./contexts/questionsContext";

const root = ReactDOM.createRoot(
   document.getElementById("root") as HTMLElement
);
root.render(
   <React.StrictMode>
      <SocketProvider>
         <UserProvider>
            <QuestionProvider>
               <App />
            </QuestionProvider>
         </UserProvider>
      </SocketProvider>
   </React.StrictMode>
);
