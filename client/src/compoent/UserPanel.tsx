import React from "react";
import styled from "styled-components";
import { useUser } from "../contexts/userContext";
import { Avatar } from "@mui/material";

const UserPanelStyled = styled.div`
   display: flex;
   align-items: center;
   justify-content: space-between;
   gap: 1rem;
   background-color: rgba(0,0,0,0);
   color: white;
   font-weight: lighter;
   padding: .5rem 2rem .5rem .5rem;
   border-radius: 2rem;
   position: absolute;
   top: 1rem;
   right: 1rem;
   box-shadow: 0px 2px 20px rgba(0,0,0,.5);
`;

function UserPanel() {
   const { username, numberAvatar } = useUser();

   const pathImage = `./imgs/user${numberAvatar}.gif`;

   return (
      <UserPanelStyled>
         <Avatar alt="User image" src={pathImage} />
         <p>{username}</p>
      </UserPanelStyled>
   );
}

export default UserPanel;
