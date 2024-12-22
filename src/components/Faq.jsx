import React, { useState, useEffect } from "react";
import axios from "axios";

const Faq = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleQuestions, setVisibleQuestions] = useState([]);

  const processFaqs = (faqs) => {
    return faqs.reduce((acc, faq) => {
      const { category, faqs: faqsString } = faq;
      const parsedFaqs = JSON.parse(`[${faqsString}]`);
      acc[category] = parsedFaqs;
      return acc;
    }, {});
  };

  const toggleVisibility = (id) => {
    setVisibleQuestions((prev) =>
      prev.includes(id) ? prev.filter((questionId) => questionId !== id)
        : [...prev, id]
    );
  };

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await axios.get('/api/faq');
        console.log('Response: ', response.data);
        if (!response.data.success) {
          throw new Error();
        }
        setFaqs(processFaqs(response.data.faqs));
      } catch (error) {
        setError('Failed to load FAQs');
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();
  }, []);

  console.log('Faqs: ', faqs);

  return (
    <div className="faq">
      <h2>Frequently Asked Questions (F.A.Q)</h2>
      <div className="faq__content">
        {Object.keys(faqs).map((category) => {
          console.log('Faqs: ', faqs[category]);

          return (
            <div key={category} className="faq__category">
              <h3>{category}</h3>
              {faqs[category].map((faq) => {
                return (
                  <div
                    key={faq.id}
                    className="faq__content"
                  >
                    <div
                      className="faq__question"
                      onClick={() => toggleVisibility(faq.id)}
                    >
                      {faq.question}
                    </div>
                    {visibleQuestions.includes(faq.id) && (
                      <div className="faq__answer">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Faq;