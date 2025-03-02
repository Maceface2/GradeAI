import React from 'react'
import { styled } from 'styled-components'
import Navbar from "@/components/Dashboard/Navbar"

const Courses = () => {
  return (
    <>
    <Navbar/>
    <Section>
     
      <Classes>
        <CourseList>
            
            <li>
                <a href ="">Computer Science 263</a>
            </li>
            <li>
                <a href ="">Computer Science 473</a>
            </li>
            <li>
                <a href ="">Computer Science 464</a>
            </li>
            <li>
                <a href ="">CAMS 25</a>
            </li>
            <li>
                <a href ="">IST 110</a>
            </li>
            <li>
                <a href ="">MATH 319</a>
            </li>
        </CourseList>
      </Classes>

    </Section>
    </>
  );
};



const Section = styled.section`
  display: flex;
  font-family: sans-serif;
  height: 100vh;
  color: white;
  background: #1b1b25;
  position: relative;
  justify-content: flex-start;
`;
const Classes = styled.div`
  width: 19%;
  border-right: 2px solid gray; 
  display: flex;
  justify-content: top;

`;
const CourseList = styled.ul`
  list-style-type: None;
  padding: 0;
  
  li {
    padding: 8px;
    font-size: 1.2rem;
    border: 2px solid gray;

  }
  a {
    text-decoration: none;
    color: #ffffff;
    &:hover {
    background-color: ${(props) => (props.primary ? '#ff8c00' : '#00A000')};
    color: #ffffff;
  }
  }
`;
export default Courses;