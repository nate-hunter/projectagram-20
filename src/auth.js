import React, { createContext } from "react";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import defaultUserImage from './images/default-user-image.jpg'
import { useMutation } from "@apollo/react-hooks";
import { CREATE_USER } from "./graphql/mutations";

// CODE PROVIDED FROM:
// https://hasura.io/blog/authentication-and-authorization-using-hasura-and-firebase/

const provider = new firebase.auth.GoogleAuthProvider();

// Find these options in your Firebase console
firebase.initializeApp({
    apiKey: "AIzaSyBcVjTwOV0YJdrlbVrv5alW-or-LLyFcRk",
    authDomain: "projectagram-de240.firebaseapp.com",
    databaseURL: "https://projectagram-de240-default-rtdb.firebaseio.com",
    projectId: "projectagram-de240",
    storageBucket: "projectagram-de240.appspot.com",
    messagingSenderId: "367061320802",
    appId: "1:367061320802:web:170d0a280ee545aa137d3b"
});

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = React.useState({ status: "loading" });
  const [createUser] = useMutation(CREATE_USER)

  React.useEffect(() => {
    firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        const token = await user.getIdToken();
        const idTokenResult = await user.getIdTokenResult();
        const hasuraClaim =
          idTokenResult.claims["https://hasura.io/jwt/claims"];

        if (hasuraClaim) {
          setAuthState({ status: "in", user, token });
        } else {
          // Check if refresh is required.
          const metadataRef = firebase
            .database()
            .ref(`metadata/${user.uid}/refreshTime`);

          metadataRef.on("value", async (data) => {
            if(!data.exists) return
            // Force refresh to pick up the latest custom claims changes.
            const token = await user.getIdToken(true);
            setAuthState({ status: "in", user, token });
          });
        }
      } else {
        setAuthState({ status: "out" });
      }
    });
  }, []);

  async function logInWithGoogle() { 
    const data = await firebase.auth().signInWithPopup(provider);
    // console.log({ data })
    if (data.additionalUserInfo.isNewUser) {
      console.log('is new user???', { data })
      const { uid, displayName, email, photoURL } = data.user
      const username = `${displayName.replace(/\s+/g, "")}${uid.slice(-5)}}`
      const variables = {
        userId: uid,
        name: displayName,
        username,
        email,
        bio: "",
        website: '',
        phoneNumber: '',
        profileImage: photoURL
      };
      await createUser({ variables })
    }
  };

  const logInWithEmailAndPassword = async (email, password) => {
    const userData = await firebase.auth().signInWithEmailAndPassword(email, password);
    return userData;
  }

  const signUpWithEmailAndPassword = async formData => {
    const userData = await firebase.auth().createUserWithEmailAndPassword(formData.email, formData.password);
    if (userData.additionalUserInfo.isNewUser) {
      const variables = {
        userId: userData.user.uid,
        name: formData.username,
        username: formData.username,
        email: userData.user.email,
        bio: "",
        website: '',
        phoneNumber: '',
        profileImage: defaultUserImage
      };
      await createUser({ variables })
    }
  }

  const signOut = async () => {
    setAuthState({ status: "loading" });
    await firebase.auth().signOut();
    setAuthState({ status: "out" });
  };

  async function updateEmail(email) {
    await authState.user.updateEmail(email);
  }

  async function updateEmail(email) {
    await authState.user.updateEmail(email);
  }

  if (authState.status === "loading") {
    return null;
  } else {
    return (
      <AuthContext.Provider
        value={{
            authState,
            logInWithGoogle,
            logInWithEmailAndPassword,
            signUpWithEmailAndPassword, 
            signOut,
            updateEmail
        }}
      >
          {children}
      </AuthContext.Provider>
    );
  }
}

export default AuthProvider;