import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';

const Hero = () => {
  return (
    <Section>
        <Container>
          <ImageColumn>
            <img src="undraw_teacher_s628.svg" alt="Hero Image" />
          </ImageColumn>
          <HeroTextColumn>
            <Header>
              Welcome to GradeAI
            </Header>
            <SubheaderAndStarsColumn>
              <SubHeader>Where AI grades for you</SubHeader>
              <Link href = "/auth/signup">
                <SignupButton>Sign Up</SignupButton>
              </Link>
            </SubheaderAndStarsColumn>
          </HeroTextColumn>
        </Container>
    </Section>
  );
};

const Section = styled.section`
  display: flex;
  font-family: sans-serif;
  height: 100vh;
  color: white;
  background: #1b1b25;
  position: relative;
  justify-content: flex-end;
`;


const Container = styled.div`
  display: flex;
  align-items: center;
  height: 90vh;
  width: 100%;
  padding: 0 7vw;
`;

const HeroTextColumn = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-left: auto;
  width: 50%;

`;
const ImageColumn = styled.div`
  width: 40%;  
  img {
    width: 100%; 
    height: auto;
    margin-right: 30px;
  }
`;

const Header = styled.h1`
  font-size: calc(2rem + 2vw);
`;

const SubHeader = styled.h2`
  font-size: calc(1rem + 1vw);
  margin-top: 20px;
`;

const SubheaderAndStarsColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1vw;
`;

const SignupButton = styled.button`
  width: 50%;
  margin-top: 20px;
  padding: 10px 20px;
  font-size: 1rem;
  color: #fff;
  background-color: #007bff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;


  &:hover {
    background-color: #0056b3;
  }
`;

export default Hero;
