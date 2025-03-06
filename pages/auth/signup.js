import React, { useState } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/router'
import { useStateContext } from '@/context/StateContext'
import { isEmailInUse, register} from '@/backend/Auth'
import Link from 'next/link'
import Navbar from '@/components/Dashboard/Navbar'
const Signup = () => {

  const { user, setUser } = useStateContext()
  const [ email, setEmail ] = useState('')
  const [ password, setPassword ] = useState('')
  const [ role, setRole ] = useState("")
  const [ name, setName ] = useState("")

  const router = useRouter()

  async function validateEmail(){
    const emailRegex = /^[\w.%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if(emailRegex.test(email) == false ){
        return false;
    }
    console.log('so far so good...')
    const emailResponse = await isEmailInUse(email)
    console.log('email response', emailResponse)
    if(emailResponse.length == 0 ){
        return false;
    }

    return true;
}

  async function handleSignup(){
    const isValidEmail = await validateEmail()
    // console.log('isValidEmail', isValidEmail)
    // if(!isValidEmail){ return; }
    
    try{
        await register(email, password, role, setUser, name)
        console.log(role)
        router.push('/')
    }catch(err){
        console.log('Error Signing Up', err)
    }
  }


  return (
    <>
    <Navbar/>
    <Section>
      <Container>
        <Header>Sign up for GradeAI</Header>
        <InputTitle>Email</InputTitle>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)}/>
        <InputTitle>Password</InputTitle>
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
        <InputTitle>Name</InputTitle>
        <Input type="text" value={name} onChange={(e) => setName(e.target.value)}/>
        <select value = {role} onChange = {(e)=> setRole(e.target.value)}>
          <option value="">-- Choose --</option>
          <option value="student">Student</option>
          <option value="instructor">Instructor</option>
        </select>
        <UserAgreementText>By signing in, you automatically agree to our <UserAgreementSpan href='/legal/terms-of-use' rel="noopener noreferrer" target="_blank"> Terms of Use</UserAgreementSpan> and <UserAgreementSpan href='/legal/privacy-policy' rel="noopener noreferrer" target="_blank">Privacy Policy.</UserAgreementSpan></UserAgreementText>

        <MainButton onClick={handleSignup}>Signup</MainButton>
      </Container>
    </Section>
    </>
  )
}

const Section = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  color: #333;
  background-color:  #1b1b25;

`;
const Container = styled.div`
  max-width: 400px;
  margin: 25px auto;
  background-color: #3b3b3b;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  select {
    width: 200px;
    padding: 10px;
    margin-Top: 10px;
    background-color: #2a2a35;
    border-radius:5px;
    color:white;
    font-Size: 16px;
    cursor: pointer;
  }
`;

const Header = styled.h1`
  font-size: 24px;
  margin: 0;
  padding: 20px 0;
  color: white;
`;
// styles the input text boxes
const Input = styled.input`
  font-size: 16px;
  padding: 10px;
  margin-bottom: 20px;
  border: 2px solid #ddd;
  border-radius: 4px;
  width: 80%; 
  box-sizing: border-box; 
  &:focus {
    border-color: #007bff;
    box-shadow: 0 0 8px rgba(0,123,255,.2);
  }
`;
// styles the title of the sign up page
const InputTitle = styled.label` 
  font-size: 14px;
  color: white;
  margin-bottom: 5px;
  margin-top: 10px;
  display: block;
`;
//submit button for the sign up 
const MainButton = styled.button`
  font-size: 16px;
  color: white;
  background-color: green;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  &:hover {
    background-color: gray;
  }
`;

//sets the text style of the user agreement
const UserAgreementText = styled.p`
  font-size: 12px;
  color: #E0E0E0;
  margin-top: 20px;
  text-align: center;
`;

//hyper links in the user agreement
const UserAgreementSpan = styled(Link)` 
  color: #007bff;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
  &:not(:last-of-type)::after {
    content: ', '; 
  }
`;


export default Signup