import React from "react";

const ProfileCompletionPopup = ({ onClose, onComplete }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Complete Your Profile</h2>
        <p className="text-gray-600 mb-6">
          Completing your profile for easier job application process!!
        </p>
        <div className="flex justify-end space-x-4">
          <button
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            onClick={onClose}
          >
            I'll do it later
          </button>
          <button
            className="px-4 py-2 rounded-lg font-medium 
             bg-[#58A6FF] text-white 
             hover:bg-[#1A2E46] hover:text-white"
            onClick={onComplete}
          >
            Complete Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletionPopup;
