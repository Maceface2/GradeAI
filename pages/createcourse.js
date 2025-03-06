import React, { useState, useEffect } from 'react';
import { styled } from 'styled-components';
import { useRouter } from 'next/router';
import Navbar from "@/components/Dashboard/Navbar";
import { useStateContext } from '@/context/StateContext';
import { collection, doc, getDoc, getDocs, addDoc, serverTimestamp, updateDoc, arrayUnion, query, where, setDoc } from "firebase/firestore";
import { database } from "@/backend/Firebase";
import { gradeSubmission } from '@/backend/gptAPI.js';

const CreateCourse = () => {
  const router = useRouter();
  const { courseId } = router.query;
  const { user } = useStateContext();
  const [courseInfo, setCourseInfo] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [title, setTitle] = useState('');
  const [answerKeyText, setAnswerKeyText] = useState('');
  const [message, setMessage] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submissions, setSubmissions] = useState({});
  const [studentSubmissions, setStudentSubmissions] = useState({});
  const [gradingInProgress, setGradingInProgress] = useState({});

  // Load course data when courseId or user changes
  useEffect(() => {
    if (courseId && user) fetchCourseData();
  }, [courseId, user]);

  // Get course info, students, assignments and submissions
  const fetchCourseData = async () => {
    setLoading(true);
    
    try {
      // Get course info
      const courseDoc = await getDoc(doc(database, "courses", courseId));
      
      if (!courseDoc.exists()) {
        console.log("course not found!");
        router.push('/courses');
        return;
      }
      
      const courseData = { id: courseDoc.id, ...courseDoc.data() };
      setCourseInfo(courseData);
      
      // Get students
      const studentsData = [];
      if (courseData.students && courseData.students.length > 0) {
        for (const studentId of courseData.students) {
          const studentDoc = await getDoc(doc(database, "users", studentId));
          if (studentDoc.exists()) {
            studentsData.push({ id: studentDoc.id, ...studentDoc.data() });
          }
        }
      }
      setEnrolledStudents(studentsData);
      
      // get assignments
      const assignmentsSnapshot = await getDocs(collection(database, "courses", courseId, "assignments"));
      const assignmentsList = [];
      const submissionsObj = {};
      const allStudentSubmissions = {};
      
      for (const assignmentDoc of assignmentsSnapshot.docs) {
        const assignmentData = { id: assignmentDoc.id, ...assignmentDoc.data() };
        assignmentsList.push(assignmentData);
        
        // get submissions based on user role
        if (user.role === "student") {
          const submissionDoc = await getDoc(doc(database, "courses", courseId, "assignments", assignmentDoc.id, "submissions", user.uid));
          if (submissionDoc.exists()) {
            submissionsObj[assignmentDoc.id] = submissionDoc.data();
          }
        } else if (user.role === "instructor") {
          const submissionsSnapshot = await getDocs(collection(database, "courses", courseId, "assignments", assignmentDoc.id, "submissions"));
          const assignmentSubmissions = {};
          submissionsSnapshot.docs.forEach(doc => {
            assignmentSubmissions[doc.id] = doc.data();
          });
          allStudentSubmissions[assignmentDoc.id] = assignmentSubmissions;
        }
      }
      
      setAssignments(assignmentsList);
      setSubmissions(submissionsObj);
      setStudentSubmissions(allStudentSubmissions);
    } catch (error) {
      console.error("Error fetching course data:", error);
      setMessage("Error loading course data");
    } finally {
      setLoading(false);
    }
  };

  // Create a new assignment
  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !answerKeyText.trim()) {
      setMessage('Please provide both title and answer key');
      return;
    }
    
    setLoading(true);
    
    try {
      const newAssignmentRef = await addDoc(collection(database, 'courses', courseId, 'assignments'), {
        title: title,
        answerKeyText: answerKeyText,
        createdAt: serverTimestamp(),
        createdBy: user.uid
      });
      
      setAssignments([...assignments, {
        id: newAssignmentRef.id,
        title: title,
        answerKeyText: answerKeyText,
        createdAt: new Date(),
        createdBy: user.uid
      }]);
      
      setTitle('');
      setAnswerKeyText('');
      setShowAssignmentForm(false);
      setMessage('Assignment created successfully!');
    } catch (error) {
      console.error("Error creating assignment:", error);
      setMessage(`Error creating assignment: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Submit an assignment as a student
  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    
    if (!submissionText.trim()) {
      setMessage('Please enter your submission');
      return;
    }
    
    setLoading(true);
    setMessage('Grading in progress...');
    
    try {
      // Grade the submission
      const gradingResult = await gradeSubmission(selectedAssignment.answerKeyText, submissionText);
      
      // Save submission with grade
      await setDoc(doc(database, "courses", courseId, "assignments", selectedAssignment.id, "submissions", user.uid), {
        userId: user.uid,
        submissionText: submissionText,
        submittedAt: serverTimestamp(),
        studentName: user.name || "Unknown Student",
        studentEmail: user.email || "No Email",
        isGraded: true,
        grade: gradingResult.grade,
        feedback: gradingResult.feedback,
        submissionStatus: "Graded"
      });
      
      // Update local state
      setSubmissions({
        ...submissions,
        [selectedAssignment.id]: {
          userId: user.uid,
          submissionText: submissionText,
          submittedAt: new Date(),
          studentName: user.name || "Unknown Student",
          studentEmail: user.email || "No Email",
          isGraded: true,
          grade: gradingResult.grade,
          feedback: gradingResult.feedback,
          submissionStatus: "Graded"
        }
      });
      
      setSubmissionText('');
      setMessage('Assignment submitted and graded successfully!');
    } catch (error) {
      console.error("Error submitting assignment:", error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Add a student to the course
  const handleAddStudent = async (e) => {
    e.preventDefault();
    
    if (!studentEmail.trim()) {
      setMessage('Please provide a student email');
      return;
    }
    
    setLoading(true);
    
    try {
      // Find student by email
      const q = query(collection(database, "users"), where("email", "==", studentEmail));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setMessage(`No user found with email ${studentEmail}`);
        return;
      }
      
      const userDoc = querySnapshot.docs[0];
      const userId = userDoc.id;
      const userData = userDoc.data();
      
      // Check if already enrolled
      if (courseInfo.students && courseInfo.students.includes(userId)) {
        setMessage(`Student ${userData.name} is already enrolled`);
        return;
      }
      
      // Add student to course
      await updateDoc(doc(database, "courses", courseId), { 
        students: arrayUnion(userId) 
      });
      
      // Add course to student
      await updateDoc(doc(database, "users", userId), { 
        enrolledCourses: arrayUnion(courseId) 
      });
      
      // Update local state
      setCourseInfo({
        ...courseInfo,
        students: [...(courseInfo.students || []), userId]
      });
      
      setEnrolledStudents([...enrolledStudents, { id: userId, ...userData }]);
      setStudentEmail('');
      setShowStudentForm(false);
      setMessage(`Student ${userData.name} added successfully!`);
    } catch (error) {
      console.error("Error adding student:", error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Grade a student submission
  const handleGradeSubmission = async (studentId, submission) => {
    setGradingInProgress(prev => ({ ...prev, [studentId]: true }));
    setMessage('Grading in progress...');
    
    try {
      // Grade the submission
      const gradingResult = await gradeSubmission(
        selectedAssignment.answerKeyText,
        submission.submissionText
      );
      
      // Update the submission with grade
      await updateDoc(doc(database, "courses", courseId, "assignments", selectedAssignment.id, "submissions", studentId), {
        grade: gradingResult.grade,
        feedback: gradingResult.feedback,
        isGraded: true,
        submissionStatus: "Graded",
        gradedAt: serverTimestamp()
      });
      
      // Update local state
      setStudentSubmissions(prev => ({
        ...prev,
        [selectedAssignment.id]: {
          ...prev[selectedAssignment.id],
          [studentId]: {
            ...prev[selectedAssignment.id][studentId],
            grade: gradingResult.grade,
            feedback: gradingResult.feedback,
            isGraded: true,
            submissionStatus: "Graded",
            gradedAt: new Date()
          }
        }
      }));
      
      setMessage(`Successfully graded ${submission.studentName}'s submission!`);
    } catch (error) {
      console.error("Error grading:", error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setGradingInProgress(prev => ({ ...prev, [studentId]: false }));
    }
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return "N/A";
    if (typeof date === 'object' && date.toDate) date = date.toDate();
    
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  return (
    <>
      <Navbar />
      <Section>
        {/* Sidebar with assignments list */}
        <SidePanel>
          <h2>Assignments</h2>
          {loading ? (
            <p>Loading assignments...</p>
          ) : assignments.length > 0 ? (
            <AssignmentList>
              {assignments.map(assignment => (
                <li key={assignment.id}>
                  <AssignmentItem 
                    onClick={() => setSelectedAssignment(assignment)}
                    active={selectedAssignment?.id === assignment.id}
                    submitted={submissions[assignment.id]}
                  >
                    <div className="title">{assignment.title}</div>
                    {submissions[assignment.id] && (
                      <div className="submitted">
                        Submitted - {submissions[assignment.id].submissionStatus || "Pending"}
                      </div>
                    )}
                  </AssignmentItem>
                </li>
              ))}
            </AssignmentList>
          ) : (
            <p>No assignments yet for this course.</p>
          )}
        </SidePanel>
        
        {/* Main content area */}
        <MainContent>
          <CourseHeader>
            <h1>{courseInfo?.name || 'Loading...'}</h1>
            {user?.role === "instructor" && (
              <ButtonContainer>
                <Button onClick={() => setShowAssignmentForm(true)}>Add Assignment</Button>
                <Button onClick={() => setShowStudentForm(true)}>Add Student</Button>
              </ButtonContainer>
            )}
          </CourseHeader>
          
          {/* Show messages */}
          {message && <MessageBox success={!message.includes('Error')}>{message}</MessageBox>}
          
          {/* Assignment creation form */}
          {showAssignmentForm && (
            <FormContainer>
              <h2>Create New Assignment</h2>
              <form onSubmit={handleCreateAssignment}>
                <FormGroup>
                  <label htmlFor="title">Assignment Title</label>
                  <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </FormGroup>
                
                <FormGroup>
                  <label htmlFor="answerKey">Answer Key</label>
                  <TextArea 
                    id="answerKey" 
                    value={answerKeyText} 
                    onChange={(e) => setAnswerKeyText(e.target.value)} 
                    placeholder="Enter the answer key text here..." 
                    rows={10} 
                    required 
                  />
                </FormGroup>
                
                <ButtonGroup>
                  <Button type="submit">Create Assignment</Button>
                  <Button type="button" secondary onClick={() => setShowAssignmentForm(false)}>Cancel</Button>
                </ButtonGroup>
              </form>
            </FormContainer>
          )}
          
          {/* Add student form */}
          {showStudentForm && (
            <FormContainer>
              <h2>Add Student to Course</h2>
              <form onSubmit={handleAddStudent}>
                <FormGroup>
                  <label htmlFor="studentEmail">Student Email</label>
                  <input type="email" id="studentEmail" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} required />
                </FormGroup>
                
                <ButtonGroup>
                  <Button type="submit">Add Student</Button>
                  <Button type="button" secondary onClick={() => setShowStudentForm(false)}>Cancel</Button>
                </ButtonGroup>
              </form>
            </FormContainer>
          )}
          
          {/* Assignment details */}
          {selectedAssignment && (
            <AssignmentDetailContainer>
              <AssignmentHeader>
                <h2>{selectedAssignment.title}</h2>
                <CloseButton onClick={() => setSelectedAssignment(null)}>×</CloseButton>
              </AssignmentHeader>
              
              {/* Student submission section */}
              {user?.role === "student" && (
                <div>
                  {submissions[selectedAssignment.id] ? (
                    <div>
                      <h3>Your Submission</h3>
                      <p>Submitted: {formatDate(submissions[selectedAssignment.id].submittedAt)}</p>
                      <p>Status: {submissions[selectedAssignment.id].submissionStatus || "Pending"}</p>
                      {submissions[selectedAssignment.id].grade && <p>Grade: {submissions[selectedAssignment.id].grade}</p>}
                      {submissions[selectedAssignment.id].feedback && <p>Feedback: {submissions[selectedAssignment.id].feedback}</p>}
                      
                      <h4>Your Submission:</h4>
                      <pre>{submissions[selectedAssignment.id].submissionText}</pre>
                      
                      <form onSubmit={handleSubmitAssignment}>
                        <FormGroup>
                          <label>Update Submission</label>
                          <TextArea 
                            value={submissionText} 
                            onChange={(e) => setSubmissionText(e.target.value)} 
                            placeholder="Enter your updated submission here..." 
                            rows={10} 
                          />
                        </FormGroup>
                        <Button type="submit">Update Submission</Button>
                      </form>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitAssignment}>
                      <FormGroup>
                        <label>Your Submission</label>
                        <TextArea 
                          value={submissionText} 
                          onChange={(e) => setSubmissionText(e.target.value)} 
                          placeholder="Enter your submission here..." 
                          rows={10} 
                          required 
                        />
                      </FormGroup>
                      <Button type="submit">Submit Assignment</Button>
                    </form>
                  )}
                </div>
              )}
              
              {/* Instructor section */}
              {user?.role === "instructor" && (
                <div>
                  <h3>Answer Key:</h3>
                  <AnswerKeyContainer>
                    <pre>{selectedAssignment.answerKeyText}</pre>
                  </AnswerKeyContainer>
                  
                  <h3>Student Submissions</h3>
                  {studentSubmissions[selectedAssignment.id] && 
                   Object.keys(studentSubmissions[selectedAssignment.id]).length > 0 ? (
                    <StyledTable>
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>Email</th>
                          <th>Submitted</th>
                          <th>Status</th>
                          <th>Grade</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(studentSubmissions[selectedAssignment.id]).map(([studentId, submission]) => (
                          <tr key={studentId}>
                            <td>{submission.studentName || "Unknown"}</td>
                            <td>{submission.studentEmail || "No Email"}</td>
                            <td>{formatDate(submission.submittedAt)}</td>
                            <td>{submission.submissionStatus || "Submitted"}</td>
                            <td>{submission.grade || "Not graded"}</td>
                            <td>
                              {!submission.isGraded && (
                                <Button 
                                  onClick={() => handleGradeSubmission(studentId, submission)}
                                  disabled={gradingInProgress[studentId]}
                                >
                                  {gradingInProgress[studentId] ? 'Grading...' : 'Grade'}
                                </Button>
                              )}
                              <Button onClick={() => alert(submission.submissionText)}>
                                View
                              </Button>
                              {submission.feedback && <p>Feedback: {submission.feedback}</p>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </StyledTable>
                  ) : (
                    <p>No student submissions yet.</p>
                  )}
                </div>
              )}
            </AssignmentDetailContainer>
          )}
          
          {/* Course overview */}
          {!showAssignmentForm && !showStudentForm && !selectedAssignment && (
            <>
              <div>
                {courseInfo ? (
                  <>
                    <p>Course: {courseInfo.name}</p>
                    <p>Students: {courseInfo.students?.length || 0}</p>
                    <p>Assignments: {assignments.length}</p>
                  </>
                ) : (
                  <p>Loading course information...</p>
                )}
              </div>
              
              {/* Student list for instructors */}
              {enrolledStudents.length > 0 && user?.role === "instructor" && (
                <div>
                  <h2>Enrolled Students</h2>
                  <StyledTable>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enrolledStudents.map(student => (
                        <tr key={student.id}>
                          <td>{student.name || "No name"}</td>
                          <td>{student.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </StyledTable>
                </div>
              )}
            </>
          )}
        </MainContent>
      </Section>
    </>
  );
};

// Basic styled components
const Section = styled.section`
  display: flex;
  min-height: 100vh;
  color: white;
  background: #1b1b25;
`;

const SidePanel = styled.div`
  width: 250px;
  border-right: 2px solid gray;
  padding: 20px;
  background-color: #2a2a35;
  border-radius: 8px;
`;

const MainContent = styled.div`
  flex: 1;
  padding: 20px;
  background-color: #1b1b25;
`;

const CourseHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
`;

const AssignmentList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
`;

const AssignmentItem = styled.div`
  padding: 10px;
  border: 1px solid gray;
  margin-bottom: 10px;
  border-radius: 4px;
  cursor: pointer;
  background-color: ${props => props.active ? '#00A000' : props.submitted ? '#2a4a2a' : 'transparent'};
  
  &:hover {
    background-color: ${props => props.active ? '#00A000' : '#2a2a35'};
  }
`;

const Button = styled.button`
  background-color: ${props => props.secondary ? '#555' : '#00A000'};
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  opacity: ${props => props.disabled ? 0.5 : 1};
`;

const FormContainer = styled.div`
  background-color: #2a2a35;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
  
  label {
    display: block;
    margin-bottom: 5px;
  }
  
  input {
    width: 100%;
    padding: 8px;
    border-radius: 4px;
    background-color: #333;
    color: white;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  background-color: #333;
  color: white;
  resize: vertical;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 20px;
`;

const MessageBox = styled.div`
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 4px;
  background-color: ${props => props.success ? '#004400' : '#440000'};
  color: white;
`;

const AssignmentDetailContainer = styled.div`
  background-color: #2a2a35;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const AssignmentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #aaa;
  font-size: 24px;
  cursor: pointer;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  
  th, td {
    border: 1px solid #444;
    padding: 10px;
    text-align: left;
  }
  
  th {
    background-color: #333;
  }
  
  td {
    background-color: #2a2a35;
  }
`;

const AnswerKeyContainer = styled.div`
  border: 2px solid #00A000;
  padding: 10px;
  border-radius: 4px;
  background-color: #2a2a35;
`;

export default CreateCourse;