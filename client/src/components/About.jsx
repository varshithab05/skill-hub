import React, { useState } from "react";

const About = () => {
  // State to track which question is open
  const [openQuestion, setOpenQuestion] = useState(null);

  // Toggle function to handle open/close of answers
  const toggleQuestion = (index) => {
    setOpenQuestion(openQuestion === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r  text-white p-8">
      {/* About Section */}
      <section className="mb-12 text-center">
        <h1 className="text-5xl font-extrabold text-blue-400 mb-6">
          About Our Freelancing Platform
        </h1>
        <p className="text-gray-300 mb-4 text-lg max-w-3xl mx-auto">
          Welcome to our freelancing platform, where freelancers and enterprises
          connect seamlessly. Whether you're a freelancer looking for your next
          project, an enterprise needing expert talent, or a hybrid user seeking
          the best of both worlds, our platform is designed to meet your needs.
        </p>
        <p className="text-gray-300 text-lg max-w-3xl mx-auto">
          We offer a dynamic space where freelancers can showcase their skills,
          enterprises can find the right talent for their tasks, and hybrid
          users can enjoy the flexibility of both posting and completing tasks.
          With transparent commission rates and a user-friendly interface, we
          ensure a smooth experience for all users.
        </p>
      </section>

      {/* FAQ Section */}
      <h1 className="text-4xl font-bold mb-6 text-center text-blue-400">
        Frequently Asked Questions
      </h1>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* FAQ 1 */}
        <div className="bg-gray-800 rounded-lg p-6 shadow-md transition-all duration-300 transform hover:-translate-y-1">
          <div
            className="cursor-pointer flex justify-between items-center"
            onClick={() => toggleQuestion(1)}
          >
            <h2 className="text-2xl font-semibold text-blue-300">
              What is this platform about?
            </h2>
            <span
              className={`transform transition-transform ${
                openQuestion === 1 ? "rotate-180" : "rotate-0"
              }`}
            >
              ▼
            </span>
          </div>
          {openQuestion === 1 && (
            <p className="mt-4 text-gray-400 transition-opacity duration-500 ease-in-out opacity-100">
              This is a freelancing platform where users can either offer their
              services as freelancers, hire freelancers as enterprises, or do
              both as hybrid users.
            </p>
          )}
        </div>

        {/* FAQ 2 */}
        <div className="bg-gray-800 rounded-lg p-6 shadow-md transition-all duration-300 transform hover:-translate-y-1">
          <div
            className="cursor-pointer flex justify-between items-center"
            onClick={() => toggleQuestion(2)}
          >
            <h2 className="text-2xl font-semibold text-blue-300">
              What are the different user types?
            </h2>
            <span
              className={`transform transition-transform ${
                openQuestion === 2 ? "rotate-180" : "rotate-0"
              }`}
            >
              ▼
            </span>
          </div>
          {openQuestion === 2 && (
            <p className="mt-4 text-gray-400 transition-opacity duration-500 ease-in-out opacity-100">
              There are three types of users on our platform:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>
                  <span className="font-bold text-blue-300">Freelancer:</span>{" "}
                  Only completes tasks.
                </li>
                <li>
                  <span className="font-bold text-blue-300">Enterprise:</span>{" "}
                  Only posts tasks.
                </li>
                <li>
                  <span className="font-bold text-blue-300">Hybrid:</span> Can
                  both post and complete tasks.
                </li>
              </ul>
            </p>
          )}
        </div>

        {/* FAQ 3 */}
        <div className="bg-gray-800 rounded-lg p-6 shadow-md transition-all duration-300 transform hover:-translate-y-1">
          <div
            className="cursor-pointer flex justify-between items-center"
            onClick={() => toggleQuestion(3)}
          >
            <h2 className="text-2xl font-semibold text-blue-300">
              How much commission is charged?
            </h2>
            <span
              className={`transform transition-transform ${
                openQuestion === 3 ? "rotate-180" : "rotate-0"
              }`}
            >
              ▼
            </span>
          </div>
          {openQuestion === 3 && (
            <p className="mt-4 text-gray-400 transition-opacity duration-500 ease-in-out opacity-100">
              The commission rates are based on the type of user:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>
                  <span className="font-bold text-blue-300">Freelancer:</span>{" "}
                  0.5% commission.
                </li>
                <li>
                  <span className="font-bold text-blue-300">Enterprise:</span>{" "}
                  1% commission.
                </li>
                <li>
                  <span className="font-bold text-blue-300">Hybrid:</span> 1.5%
                  commission.
                </li>
              </ul>
            </p>
          )}
        </div>

        {/* FAQ 5 */}
        <div className="bg-gray-800 rounded-lg p-6 shadow-md transition-all duration-300 transform hover:-translate-y-1">
          <div
            className="cursor-pointer flex justify-between items-center"
            onClick={() => toggleQuestion(5)}
          >
            <h2 className="text-2xl font-semibold text-blue-300">
              What payment methods are accepted?
            </h2>
            <span
              className={`transform transition-transform ${
                openQuestion === 5 ? "rotate-180" : "rotate-0"
              }`}
            >
              ▼
            </span>
          </div>
          {openQuestion === 5 && (
            <p className="mt-4 text-gray-400 transition-opacity duration-500 ease-in-out opacity-100">
              We accept various payment methods, including credit/debit cards,
              PayPal, and bank transfers.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default About;
