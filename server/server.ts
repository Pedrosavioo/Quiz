import express from "express";
import http from "http";
import path from "path";
import { WebSocket, WebSocketServer } from "ws";
import { config } from "dotenv";

config();

const app = express();

app.use(express.static(path.join(__dirname, "../client/build")));

const server = http.createServer(app);

const port = Number(process.env.PORT) || 3000;
server.listen(port, () => {
   console.log(`Server is running in port ${port}`);
});

const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", (request, socket, head) => {
   wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
   });
});

interface questionI {
   id: number;
   subject: string;
   question: string;
   response: "true" | "false";
}

interface messageI extends WebSocket {
   owner: string;
   type: string;
   content: string | questionI;
}

const clients = new Set<WebSocket>();
const users = new Set<string>();
const questions = new Set();

wss.on("connection", (ws) => {
   ws.on("message", (message) => {
      let user_valid = true;
      // receber mensagens enviadas pelo navegador
      const parsedMessage: messageI = JSON.parse(message.toString());

      // verificar se o usuário possui o mesmo nome
      if (parsedMessage.type === "login") {
         users.forEach((name_register) => {
            if (name_register === parsedMessage.content) {
               user_valid = false;
               ws.send(
                  JSON.stringify({
                     type: "Error",
                     content: "Usuário já existe!",
                  })
               );
            }
         });

         if (user_valid) {
            // novo usuário
            users.add(parsedMessage.content as string); // Adiciona no array de nome de usuários
            // Gerar número do avatar
            console.log(users);
            clients.add(ws);
            broadcastMessage(
               parsedMessage.content as string,
               "joined",
               "entrou!"
            );
         }
      }

      if (parsedMessage.type === "getQuestions") {
         const questionsArray = Array.from(questions);
         broadcastMessage("", "responseQuestions", questionsArray);
      }

      // Adicionar pergunta
      if (parsedMessage.type === "submitQuestion") {
         const question = parsedMessage.content as questionI;
         questions.add(question); // Adiciona a nova pergunta ao conjunto
         broadcastMessage(parsedMessage.owner, "questionAdd", question);
      }

      if (parsedMessage.type === "logout") {
         users.delete(parsedMessage.content as string);
         broadcastMessage(parsedMessage.content as string, "left", "saiu!");
      }

      // data: TYPE e CONTENT
      /* if (parsedMessage.type === "setUsername") {
         // enviar dados
         ws.send(JSON.stringify({type: "Error",content: "Usuário já existe!",}));
      } */
   });

   ws.on("close", (message) => {
      clients.delete(ws);
   });
});

function broadcastMessage(
   username: string,
   type: string,
   content: any,
   sender?: WebSocket
) {
   clients.forEach((client) => {
      // Evita enviar ao remetente
      const message = {
         owner: username,
         type: type,
         content: content,
      };
      client.send(JSON.stringify(message));
   });
}
