import React, {
   ReactNode,
   createContext,
   useContext,
   useEffect,
   useState,
} from "react";

export interface IUser {
   id: number;
   username: string;
}

interface IUserContextType {
   username: string | null;
   setUsername: (username: string | null) => void;
   numberAvatar: number | null;
   addAvatar: () => void;
}

const UserContext = createContext<IUserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({
   children,
}) => {
   const [username, setUsername] = useState<string | null>(null);
   const [numberAvatar, setNumberAvatar] = useState<number | null>(null);

   function addAvatar() {
      const randomNumber = Math.floor(Math.random() * 8) + 1;
      setNumberAvatar(randomNumber);
   }

   // Use useEffect para atualizar o estado se o localStorage mudar
   useEffect(() => {
      if (username) {
         localStorage.setItem("username", username);
      }
      if (username === null) {
         localStorage.removeItem("username");
      }
   }, [username]);

   return (
      <UserContext.Provider
         value={{ username, setUsername, numberAvatar, addAvatar }}
      >
         {children}
      </UserContext.Provider>
   );
};

export const useUser = (): IUserContextType => {
   const context = useContext(UserContext);
   if (!context) {
      throw new Error("Context is type undefined");
   }
   return context;
};
