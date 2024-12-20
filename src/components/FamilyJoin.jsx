import React, {useState} from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { setError } from "../store/familySlice";

const FamilyJoin = () => {  
  const [familyToken, setFamilyToken] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const {user, isAuthenticated} = useSelector((state) => state.auth);

  const handleJoinFamily = async () => {
    if (familyToken && familyToken.length === 5 && user.user_id) {
      const response = await axios.post('/api/families/join', {
        token: familyToken,
        userId: user.user_id
      });

      if (response.data.success) {
        setErrorMessage('');
      } else {
        setErrorMessage(response.data.message);
      }
    } else {
      setErrorMessage('Invalid Token Format');
    }
  };

  return (
    <div className="familyjoin__container">
      {errorMessage && (
        <div className="familyjoin__error">{errorMessage}</div>
      )}
      <p>If you have been given a Family Token, use it below to join that family.</p>
      <input
        type="text"
        className="familyjoin__input"
        placeholder="Family Token"
        onChange={(e) => {setFamilyToken(e.target.value)}}
      />
      <button
        className="button familyjoin__btn"
        onClick={handleJoinFamily}
      >
        Join Family
      </button>
    </div>
    
  );
};

export default FamilyJoin;