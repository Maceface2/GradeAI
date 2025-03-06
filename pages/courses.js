import React, { useState, useEffect } from 'react';
import { styled } from 'styled-components';
import Navbar from "@/components/Dashboard/Navbar";
import { useStateContext } from '@/context/StateContext';
import { collection, addDoc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { database } from "@/backend/Firebase";
import { doc } from "firebase/firestore";
import { useRouter } from 'next/router';

const Courses = () => {
  const { user } = useStateContext();
  const [showInput, setShowInput] = useState(false);
  const [courseName, setCourseName] = useState('');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetchUserCourses();
    }
  }, [user]);

  const fetchUserCourses = async () => {
    if (!user || !user.uid) return;
    
    try {
      setLoading(true);
      
      const userDocRef = doc(database, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        console.error("User document not found!");
        setLoading(false);
        return;
      }
      
      const userData = userDoc.data();
      
      const courseIds = user.role === "instructor" 
        ? userData.createdCourses || [] 
        : userData.enrolledCourses || [];
      
      const coursesList = [];
      for (const courseId of courseIds) {
        const courseDocRef = doc(database, "courses", courseId);
        const courseDoc = await getDoc(courseDocRef);
        
        if (courseDoc.exists()) {
          coursesList.push({
            id: courseDoc.id,
            ...courseDoc.data()
          });
        }
      }
      
      setCourses(coursesList);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = async () => {
    if (courseName.trim() && user && user.role === "instructor") {
      try {
        const courseRef = await addDoc(collection(database, "courses"), {
          name: courseName.trim(),
          createdBy: user.uid,
          createdAt: new Date(),
          students: []
        });
        
        const userDocRef = doc(database, "users", user.uid);
        await updateDoc(userDocRef, {
          createdCourses: arrayUnion(courseRef.id)
        });
        
        setCourses([...courses, {
          id: courseRef.id,
          name: courseName.trim(),
          createdBy: user.uid,
          createdAt: new Date(),
          students: []
        }]);
        
        setCourseName('');
        setShowInput(false);
      } catch (error) {
        console.error("Error adding course:", error);
        alert("Failed to add course. Please try again.");
      }
    }
  };

  const navigateToCourse = (courseId) => {
    router.push(`/createcourse?courseId=${courseId}`);
  };

  return (
    <>
      <Navbar />
      <Section>
        <Classes>
          <CourseList>
            {loading ? (
              <LoadingMessage>Loading courses...</LoadingMessage>
            ) : courses.length > 0 ? (
              courses.map(course => (
                <CourseItem key={course.id} onClick={() => navigateToCourse(course.id)}>
                  {course.name}
                </CourseItem>
              ))
            ) : (
              <NoCoursesMessage>
                {user?.role === "instructor" 
                  ? "You haven't created any courses yet." 
                  : "You're not enrolled in any courses yet."}
              </NoCoursesMessage>
            )}
          </CourseList>
        </Classes>
        
        {user?.role === "instructor" && (
          showInput ? (
            <InputWrapper>
              <Input
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="Enter course name"
                onKeyPress={(e) => e.key === 'Enter' && handleAddCourse()}
              />
              <AddButton onClick={handleAddCourse}>+</AddButton>
            </InputWrapper>
          ) : (
            <AddClassBtn onClick={() => setShowInput(true)}>+</AddClassBtn>
          )
        )}
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
  list-style-type: none;
  padding: 0;
  width: 100%;
`;

const CourseItem = styled.li`
  padding: 10px;
  border: 1px solid gray;
  margin-bottom: 10px;
  border-radius: 4px;
  cursor: pointer;
  background-color: ${props => props.active ? '#00A000' : props.enrolled ? '#2a4a2a' : 'transparent'};
  
  &:hover {
    background-color: ${props => props.active ? '#00A000' : '#2a2a35'};
  }
`;

const LoadingMessage = styled.div`
  padding: 10px;
  text-align: center;
  color: #ccc;
`;

const NoCoursesMessage = styled.div`
  padding: 10px;
  text-align: center;
  color: #ccc;
  font-style: italic;
`;

const AddClassBtn = styled.button`
  background-color: transparent;
  color: white;
  padding: 0.5rem 1rem;
  border: 1px solid white;
  border-radius: 5px;
  font-size: 15px;
  position: absolute;
  right: 5px;
  top: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease-in-out, color 0.3s ease-in-out;
  &:hover {
    background-color: #00A000;
    color: #ffffff;
  }
`;

const InputWrapper = styled.div`
  position: absolute;
  right: 5px;
  top: 5px;
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  padding: 5px;
  font-size: 14px;
  border: 1px solid white;
  border-radius: 5px;
  background-color: #333;
  color: white;
`;

const AddButton = styled.button`
  margin-left: 5px;
  padding: 5px 10px;
  font-size: 14px;
  border: none;
  background-color: #00A000;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background-color: #008000;
  }
`;

export default Courses;