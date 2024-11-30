import React from "react";
import { useSelector } from "react-redux";

const FamilyMembers = () => {

  const familyMembers = useSelector((state) => (state.family.family_members));
  console.log(familyMembers);
  return (
    <div className="familymembers__container">
      <h2>Family Members</h2>
      <div className="familymembers__data">
        {Object.entries(familyMembers).map(([key, member]) => (
          <div className="familymembers__member" key={key}>{member.name}</div>
        ))}
      </div>

    </div>
  );
};

export default FamilyMembers;