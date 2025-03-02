import React from 'react';
import styled from 'styled-components';
import Link from 'next/link'
import { logOut } from '@/backend/Auth';
import { useStateContext } from '@/context/StateContext';
const Navbar = () => {
  const { user, setUser } = useStateContext()

  return (
    <Nav>
      <Logo onClick={() => logOut(setUser)} href="/">GradeAI</Logo>
      <NavLinks>
        <ButtonLink href="/dashboard/Home">Home</ButtonLink>
        <ButtonLink href="/about">About</ButtonLink>
        <ButtonLink href="/courses">Courses</ButtonLink>
        {user ? ( // If user is logged in, show "Log Out"
          <ButtonLink as="button" onClick={() => logOut(setUser)}>LogOut</ButtonLink>
        ) : ( // If no user, show "Sign Up" & "Login"
          <>
            <ButtonLink href="/auth/signup">Sign Up</ButtonLink>
            <ButtonLink href="/auth/login">Login</ButtonLink>
          </>
        )}
        
      </NavLinks>
    </Nav>
  );
};

const Nav = styled.nav`
  font-family: arial;
  background-color: #3b3b3b; /* Dark Gray */
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
`;

const Logo = styled(Link)`
  color: #00E000; 
  font-size: 2rem;
  font-weight: bold;
  text-decoration: none;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 1rem;
`;

const ButtonLink = styled(Link)`
  background-color: ${(props) => (props.primary ? '#ffa500' : 'transparent')};
  color: ${(props) => (props.primary ? '#202020' : 'white')};
  padding: 0.5rem 1rem;
  border: 1px solid #212121;
  border-radius: 5px;
  text-decoration: none;
  font-weight: bold;
  font-size:15px;
  transition: background-color 0.3s ease-in-out, color 0.3s ease-in-out;

  &:hover {
    background-color: ${(props) => (props.primary ? '#ff8c00' : '#00A000')};
    color: #ffffff;
  }
`;

export default Navbar;
