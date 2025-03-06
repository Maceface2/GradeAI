import { auth, database} from "./Firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, fetchSignInMethodsForEmail } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export async function login(email, password, setUser) {
  await signInWithEmailAndPassword(auth, email, password)
  .then(async (userCredential) => {
      const user = userCredential.user;

      // Fetch user role from Firestore
      const userDoc = await getDoc(doc(database, "users", user.uid));
      let role = "student";  
      let name = "";
      if (userDoc.exists()) {
          role = userDoc.data().role;
          name = userDoc.data().name;
      } else {
          console.warn("User document not found in Firestore!");
      }

      
      const userData = {
          uid: user.uid,
          email: user.email,
          role: role,
          name: name
      };

      window.localStorage.setItem("userAuthToken", JSON.stringify(userData)); // Store full user info
      setUser(userData); // Set user in state
  })
  .catch(error => {
      console.error("Login Error:", error.message);
  });
}

export async function isEmailInUse(email) {
    const methods = await fetchSignInMethodsForEmail(auth, email);
    return methods;
}

export async function register(email, password, role, setUser, Name) {
    let willLogIn = false;
    let userCreds;
    await createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      userCreds = userCredential;
      willLogIn = true;
    })
    await setDoc(doc(database, "users", userCreds.user.uid), {
      email: email,
      role: role,  // "student" or "instructor"
      name: Name,
      enrolledCourses: [], //list of courses the student is enrolled in 
      createdCourses: role === "instructor" ? [] : null //no created courses for students
    });

    if(willLogIn){
      await login(email, password, setUser)
    }
      
  }
export function logOut(setUser){
    window.localStorage.removeItem("userAuthToken")
    setUser(null)
    return
}
