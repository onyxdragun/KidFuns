import React, {useState} from "react";
import { useSelector } from "react-redux";
import axios from "axios";

const FamilyTokenGenerator = () => {

  const [familyToken, setFamilyToken] = useState('');
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const family_id = useSelector((state) => state.family.family_id);

  const handleGenerateToken = async () => {
    if (!user.user_id || !isAuthenticated || !family_id) {
      return;
    }
    try {
      const response = await axios.post('/api/families/generate-token', {
        userId: user.user_id,
        familyId: family_id
      });
      setFamilyToken(response.data.token);
    } catch (error) {
      console.error('Error generating token: ', error);
    }
  };

  return (
    <div className="familytoken__container">
      <h2>Family Token Generator</h2>
      <div className="familytoken__content">
          <input
            className="familytoken__input"
            type="text"
            placeholder="Generated Token"
            value={familyToken}
            readOnly
          />
          <button
            className="button button-teal familytoken__btn"
            onClick={handleGenerateToken}
          >
            Generate Token
            </button>
      </div>
    </div>
  )

};

export default FamilyTokenGenerator;