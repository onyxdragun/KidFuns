import React, { useState, useEffect } from "react";
import { faFloppyDisk } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSelector } from "react-redux";
import axios from "axios";


const FamilySettings = () => {

  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedDay, setSelectedDay] = useState('');
  const [enableAutoAllowance, setEnableAutoAllowance] = useState(false);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { family_id, family_name } = useSelector((state) => state.family);

  const daysOfWeek = [
    { label: "Sun", value: 0 },
    { label: "Mon", value: 1 },
    { label: "Tue", value: 2 },
    { label: "Wed", value: 3 },
    { label: "Thu", value: 4 },
    { label: "Fri", value: 5 },
    { label: "Sat", value: 6 },
  ];

  const handleSaveSettings = async () => {
    try {
      const response = await axios.patch('/api/families/save-settings', {
        familyId: family_id,
        autoAllowance: enableAutoAllowance,
        autoAllowanceDay: parseInt(selectedDay)
      });
    } catch (error) {
      setErrorMessage(error.message);
      console.error('Error saving settings: ', error);
    }
  }

  useEffect(() => {
    let isMounted = true;
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`/api/families/get-settings/${family_id}`);
        if (response.data.success) {
          if (isMounted) {
            setSelectedDay(response.data.data.auto_allowance_day);
            setEnableAutoAllowance(response.data.data.auto_allowance_enable);
          }
        }
      } catch (error) {
        setErrorMessage(error.message);
      }
    }
    fetchSettings();
    return () => {
      isMounted = false;
    }
  },[]);

  return (
    <div className="familysettings">
      <h2>Family Settings</h2>
      <div className="familysettings__settings">
        <h3>Auto Allowance</h3>
        <div className="familysettings__setting">
          <div className="familysettings__setting__label">
            <label htmlFor="autoallowance">Enable</label>
          </div>
          <div className="familysettings__setting__input">
            <input
              id="autoallowance"
              checked={enableAutoAllowance}
              onChange={((e) => setEnableAutoAllowance(e.target.checked))}
              type="checkbox" />
          </div>
        </div>
        <div className="familysettings__setting">
          <div className="familysettings__setting__label">Day of the Week</div>
          <div className="familysettings__setting__input">
            <select
              className="familysettings__day__select"
              value={selectedDay}
              onChange={((e) => setSelectedDay(e.target.value))}
            >
              <option value="" disabled>
                --- Choose a Day ---
              </option>
              {daysOfWeek.map((day) => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="familysettings__save">
        <button
          className="button button-small button-teal button-wide"
          onClick={handleSaveSettings}
        >
          <FontAwesomeIcon icon={faFloppyDisk} className="fa-lg" />
        </button>
      </div>
    </div>
  );
}

export default FamilySettings;