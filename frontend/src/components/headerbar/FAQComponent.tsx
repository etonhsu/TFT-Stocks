import React from 'react';

type FAQItem = {
    question: string;
    answer: React.ReactNode;  // Change to React.ReactNode to accept JSX elements
};

type FAQProps = {
    faqs: FAQItem[];
};

export const FAQComponent: React.FC<FAQProps> = ({ faqs }) => {
    return (
        <div>
            {faqs.map((faq, index) => (
                <div key={index}>
                    <h3>{faq.question}</h3>
                    <p>{faq.answer}</p>
                    <br/>
                </div>
            ))}
        </div>
    );
};

