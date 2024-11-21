import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { ref, get } from 'firebase/database';

import database from '../firebase/firebase.js';
import { loginUser, logoutUser } from '../store/authSlice.js';

const AuthListener = () => {
  const dispatch = useDispatch();
  const auth = getAuth();

  useEffect(() => {
    const handleAuthStateChanged = async (user) => {
      if (user) {
        try {
          const userRef = ref(database, `users/${user.uid}`);
          const snapshot = await get(userRef);

          if (snapshot.exists()) {
            const userData = snapshot.val();
            dispatch(loginUser({
              uid: user.uid,
              displayName: user.displayName,
              email: user.email,
            }));
          }
        } catch (error) {
          console.log("Error fetching user data: ", error);
        }
      } else {
        dispatch(logoutUser());
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      handleAuthStateChanged(user);
    });

    return () => unsubscribe();
  }, [dispatch, auth]);

  return null;
};

export default AuthListener;