import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-regular-svg-icons";
import { faChevronUp, faScrewdriverWrench } from "@fortawesome/free-solid-svg-icons";

const ChangeLog = () => {
  const [changeLog, setChangeLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categoryIcons= {
    features: faStar,
    fixes: faScrewdriverWrench,
    enhancements: faChevronUp
  };

  useEffect(() => {
    const fetchChangeLog = async () => {
      try {
        const response = await axios.get('/api/system/changelog');
        if (response.data.success) {
          setChangeLog(response.data.rows);
        } else {
          throw new Error();
        }
        setLoading(false);
      } catch (error) {
        setError('Error fetching changelog data');
        setLoading(false);
      }
    };
    fetchChangeLog();
  }, []);

  return (
    <div className="changelog">
      <h2>ChangeLog</h2>
      {loading ? (
        <div>Loading changelog data...</div>
      ) : (
        <div className="changelog__content">
          {changeLog.length === 0 ? (
            <p>No changelog entries available.</p>
          ) : (
            <ul className="changelog__entries">
              {changeLog.map((entry) => {
                const changes = typeof entry.changes === 'string' ? JSON.parse(entry.changes) : entry.changes;
                return (
                  <li className="changelog__entry" key={entry.id}>
                    <strong>Version: {entry.version}</strong>
                    <p className="changelog__description">{entry.description}</p>
                    <h4 className="changelog__changes__title">Changes:</h4>
                    {Object.keys(changes).map((category) => {
                      const catName = category.charAt(0).toUpperCase() + category.slice(1);
                      return (
                        <div key={category} className="changelog__entry__category">
                          <h5>{catName}</h5>
                          <ul className="changelog__entry__changes">
                            {Array.isArray(changes[category]) && changes[category].length > 0 ? (
                              changes[category].map((change, index) => (
                                <li className="changelog__entry__change" key={index}><FontAwesomeIcon icon={categoryIcons[category]} /> {change}</li>
                              ))
                            ) : (
                              <li className="changelog__entry__change"> No changes in this category</li>
                            )}
                          </ul>
                        </div>
                      )
                    })}
                    {entry.git_commit_hash && (
                      <p className="changelog__commithash">Commit Hash: {entry.git_commit_hash}</p>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default ChangeLog;