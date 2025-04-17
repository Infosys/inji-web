
import '../../../index.css'; 
import React from 'react';
import { SolidButton } from '../../../components/Common/Buttons/SolidButton';
import { useNavigate } from "react-router-dom";

export const SuccessfulLoginPage: React.FC = () => {
const navigate = useNavigate();
  return (
    <div className="bg-auth min-h-screen flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-xl pt-14 pb-10 px-10 max-w-md text-center">
        <div className="flex justify-center mb-2">
            <img src= {require("../../../assets/success_message_icon.png")} className="text-green-500 w-21 h-21" />
        </div>
        <h2 className="text-2xl text-gray-800 mb-2">Successful!</h2>
        <p className="text-gray-600 font-extralight mb-6">
          You have successfully completed your Login ! Please click on proceed to setup your passcode.
        </p>
        <SolidButton testId="Login-Success-Button" onClick={() => navigate("/pin")}
                                    title={"Proceed"} />
      </div>
    </div>
  );
};
