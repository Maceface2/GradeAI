import { auth } from "./Firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, fetchSignInMethodsForEmail } from "firebase/auth";
  
export async function login(email, password, setUser){
    await signInWithEmailAndPassword(auth, email, password)
    .then( async (userCredential) => {
        window.localStorage.setItem("userAuthToken", JSON.stringify(userCredential.user))
        setUser(JSON.parse(window.localStorage.getItem("userAuthToken")));
    })
}

export async function isEmailInUse(email) {
    const methods = await fetchSignInMethodsForEmail(auth, email);
    return methods;
}

export async function register(email, password, setUser) {
    let willLogIn = false;
    let userCreds;
    await createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      userCreds = userCredential;
      willLogIn = true;
    })

    if(willLogIn){
      await login(email, password, setUser)
    }
  }
export function logOut(setUser){
    window.localStorage.removeItem("userAuthToken")
    setUser(null)
    return
}
