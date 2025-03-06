import React from 'react'
import { styled } from 'styled-components'
import Navbar from "@/components/Dashboard/Navbar"

const About = () => {
  return (
    <>
    <Navbar/>
    <Section>
      <Aboutdiv>
        <Header>
          Welcome to GradeAI
        </Header>
        <Paragraph>
        GradeAI is an innovative AI-powered grading platform designed to revolutionize the 
        way educators assess student work. By leveraging advanced language models and intelligent
        text recognition, GradeAI automates the grading process, providing instant and detailed feedback to 
        students. This reduces the workload for educators while allowing students to quickly understand their 
        mistakes and improve their learning.
        </Paragraph>
      </Aboutdiv>
    </Section>
   
    </>
  )
}
const Section = styled.section`
  display: flex;
  font-family: arial;
  height: 100vh;
  color: white;
  background: #1b1b25;
 
  
`;
const Aboutdiv = styled.div`
  
  display: flex;
  flex-direction: column;
  position: center;
  height: 500px;
  width: 100%;
  padding: 10px;
  margin-top: 20px;
  align-items:center;

`;
const Step = styled.div`
  display:flex;
  width: 200px;
  height:200px;
  border: 2px solid white;
  border-radius: 20%;
  text-align: center;
`;

const Header = styled.h1`
  font-size: 25;
  margin: 10px;
`;
const Paragraph = styled.p`
  font-size: 16px;
  line-height: 1.6;
  width:600px;
  text-align: center;
`;


export default About