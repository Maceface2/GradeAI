import { useRouter } from 'next/router';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { setUserId } from 'firebase/analytics'

const Context = createContext();

export const StateContext = ({ children }) => {

  // Variables to Carry Across Multiple Pages
  const [user, setUser] = useState(null)

  const router = useRouter()
  const { asPath } = useRouter()

  // Main Use Effects for Initializing Variables
  useEffect(() => {
    if(router.isReady){
      if(window.localStorage.getItem("userAuthToken") !== null){
        console.log('user is already logged in')
        setUser(JSON.parse(window.localStorage.getItem("userAuthToken")));
      }

      // if the user is on a page that needs auth, he gets redirected to landing page
      if(window.localStorage.getItem("userAuthToken") == null && (asPath.includes('/dashboard'))){
        router.push('/')
      }  
    }
  }, [router.isReady])

return(
    <Context.Provider
    value={{
        user,
        setUser
    }}
    >
      {children}
    </Context.Provider>
    )
}

export const useStateContext = () => useContext(Context);
