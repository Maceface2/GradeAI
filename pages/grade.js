import { useState } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import axios from 'axios';
import styled from 'styled-components';

export default function GradePage() {
  const [answerKey, setAnswerKey] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleAnswerKeyChange = (e) => {
    if (e.target.files[0]) {
      setAnswerKey(e.target.files[0]);
    }
  };

  const handleSubmissionChange = (e) => {
    if (e.target.files[0]) {
      setSubmission(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!answerKey || !submission) {
      setError('Please upload both an answer key and a submission file.');
      return;
    }
    
    setLoading(true);
    setError('');
    setResult(null);
    
    try {
      // Upload files to Firebase Storage
      const storage = getStorage();
      
      // Upload answer key
      const answerKeyRef = ref(storage, `grading/answer-keys/${Date.now()}-${answerKey.name.replace(/[^a-zA-Z0-9.]/g, '_')}`);
      await uploadBytes(answerKeyRef, answerKey);
      const answerKeyUrl = await getDownloadURL(answerKeyRef);
      
      // Upload submission
      const submissionRef = ref(storage, `grading/submissions/${Date.now()}-${submission.name.replace(/[^a-zA-Z0-9.]/g, '_')}`);
      await uploadBytes(submissionRef, submission);
      const submissionUrl = await getDownloadURL(submissionRef);
      
      // Call the grading API with proper CORS configuration
      const response = await axios.post('http://localhost:5000/api/grade-paper', {
        submissionUrl: submissionUrl,
        answerKeyUrl: answerKeyUrl
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        withCredentials: false // Explicitly disable sending credentials
      });
      
      setResult(response.data);
    } catch (error) {
      console.error('Error grading paper:', error);
      setError(`Error grading paper: ${error.message || 'CORS issue - ensure the backend server has CORS properly configured'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title>Grade Assignment</Title>
      
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="answerKey">Answer Key (PDF)</Label>
          <FileInput 
            type="file" 
            id="answerKey" 
            accept=".pdf" 
            onChange={handleAnswerKeyChange} 
          />
          {answerKey && <FileName>{answerKey.name}</FileName>}
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="submission">Submission (PDF)</Label>
          <FileInput 
            type="file" 
            id="submission" 
            accept=".pdf" 
            onChange={handleSubmissionChange} 
          />
          {submission && <FileName>{submission.name}</FileName>}
        </FormGroup>
        
        <SubmitButton type="submit" disabled={loading}>
          {loading ? 'Grading...' : 'Grade Submission'}
        </SubmitButton>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </Form>
      
      {loading && <LoadingMessage>Grading in progress. This may take a moment...</LoadingMessage>}
      
      {result && (
        <ResultContainer>
          <ResultHeader>Grading Results</ResultHeader>
          
          <GradeDisplay>
            <GradeLabel>Grade:</GradeLabel>
            <GradeValue>{result.grade}/100</GradeValue>
          </GradeDisplay>
          
          <FeedbackSection>
            <SectionTitle>Feedback</SectionTitle>
            <FeedbackText>{result.feedback}</FeedbackText>
          </FeedbackSection>
          
          <FeedbackSection>
            <SectionTitle>Strengths</SectionTitle>
            <List>
              {result.strengths.map((strength, index) => (
                <ListItem key={index}>{strength}</ListItem>
              ))}
            </List>
          </FeedbackSection>
          
          <FeedbackSection>
            <SectionTitle>Areas for Improvement</SectionTitle>
            <List>
              {result.improvements.map((improvement, index) => (
                <ListItem key={index}>{improvement}</ListItem>
              ))}
            </List>
          </FeedbackSection>
        </ResultContainer>
      )}
    </Container>
  );
}

// Styled Components
const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  color: #f0f0f0;
`;

const Title = styled.h1`
  font-size: 28px;
  margin-bottom: 30px;
  color: #4CAF50;
`;

const Form = styled.form`
  background-color: #2a2a35;
  padding: 25px;
  border-radius: 8px;
  margin-bottom: 30px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
`;

const FileInput = styled.input`
  background-color: #1b1b25;
  color: #f0f0f0;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #444;
  width: 100%;
  cursor: pointer;
  
  &:hover {
    background-color: #222230;
  }
`;

const FileName = styled.div`
  margin-top: 8px;
  font-size: 14px;
  color: #aaa;
`;

const SubmitButton = styled.button`
  background-color: #4CAF50;
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  
  &:hover {
    background-color: #45a049;
  }
  
  &:disabled {
    background-color: #666;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #ff6b6b;
  margin-top: 15px;
  padding: 10px;
  background-color: rgba(255, 107, 107, 0.1);
  border-radius: 4px;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 20px;
  background-color: #2a2a35;
  border-radius: 8px;
  margin-bottom: 30px;
`;

const ResultContainer = styled.div`
  background-color: #2a2a35;
  padding: 25px;
  border-radius: 8px;
`;

const ResultHeader = styled.h2`
  font-size: 24px;
  margin-bottom: 20px;
  color: #4CAF50;
`;

const GradeDisplay = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 25px;
  padding: 15px;
  background-color: #1b1b25;
  border-radius: 4px;
`;

const GradeLabel = styled.span`
  font-weight: 500;
  margin-right: 10px;
`;

const GradeValue = styled.span`
  font-size: 24px;
  font-weight: 700;
  color: #4CAF50;
`;

const FeedbackSection = styled.div`
  margin-bottom: 20px;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  margin-bottom: 10px;
  color: #ddd;
`;

const FeedbackText = styled.p`
  line-height: 1.6;
  background-color: #1b1b25;
  padding: 15px;
  border-radius: 4px;
  white-space: pre-line;
`;

const List = styled.ul`
  background-color: #1b1b25;
  padding: 15px 15px 15px 35px;
  border-radius: 4px;
  margin: 0;
`;

const ListItem = styled.li`
  margin-bottom: 8px;
  line-height: 1.5;
  
  &:last-child {
    margin-bottom: 0;
  }
`;
