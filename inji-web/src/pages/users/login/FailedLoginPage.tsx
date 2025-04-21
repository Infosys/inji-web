import '../../../index.css';
import React from 'react';
import { SolidButton } from '../../../components/Common/Buttons/SolidButton';
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const FailedLoginPage: React.FC = () => {
  const { t } = useTranslation("FailedLogin");
  const navigate = useNavigate();
  
  return (
    <div className="bg-auth min-h-screen flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-xl pt-14 pb-10 px-10 max-w-md text-center">
        <div className="flex justify-center mb-2" data-testid="failure-icon">
          <img src={require("../../../assets/failure_message_icon.png")} className="text-green-500 w-21 h-21" />
        </div>
        <h2 className="text-2xl text-gray-800 mb-2" data-testid="failure-message">{t("failure-message")}</h2>
        <p className="text-gray-600 font-extralight mb-6" data-testid="failure-description">
          {t("failure-description")}
        </p>
        <SolidButton testId="Login-Failure-Button" onClick={() => navigate("/login")} title={t("retry")} />
      </div>
    </div>
  );
};
