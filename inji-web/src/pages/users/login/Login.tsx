import { FcGoogle } from "react-icons/fc";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../utils/api";
import '../../../index.css'; 
import { useTranslation } from "react-i18next";

const Login: React.FC = () => {
  const { t } = useTranslation("LoginPage");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProfileFetched, setIsProfileFetched] = useState(false);
  const navigate = useNavigate();

    const handleGoogleLogin = () => {
        setIsLoading(true);
        setError(null);
        window.location.href =
            window._env_.MIMOTO_HOST + "/oauth2/authorize/google";
    };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");

    if (status === "success") {
      setIsLoading(false);
      fetchUserProfile();
    } else if (status === "error") {
      setIsLoading(false);
      setError(params.get("error_message"));
      window.location.replace("/failed-login"); 
    }
  }, [navigate]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(api.fetchUserProfile.url(), {
        method: api.fetchUserProfile.methodType === 0 ? "GET" : "POST",
        headers: {
          ...api.fetchUserProfile.headers()
        },
        credentials: "include"
      });

      const responseData = await response.json();
      if (response.ok) {
        if (responseData.display_name) {
          localStorage.setItem(
            "displayName",
            responseData.display_name
          );
        }
        setIsProfileFetched(true);
      } else {
        setError(responseData.errorMessage);
        window.location.replace("/failed-login"); 
        throw responseData;
      }
    } catch (error) {
      console.error("Error occurred while fetching user profile:", error);
      setError("Failed to fetch user profile");
      window.location.replace("/failed-login");
    }
  };

  useEffect(() => {
    if (isProfileFetched) {
      window.location.replace("/successful-login");
    }
  }, [isProfileFetched, navigate]);
  
  const wrapperStyle: React.CSSProperties = {
    flexWrap: "nowrap", 
    whiteSpace: "nowrap", 
    padding: "24px 56px", 
    backgroundColor: "#fff",
    borderRadius: "16px",
    fontSize: "16px",
    fontWeight: 500,
    color: "#333",
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.05)",
  };

  const buttonStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    backgroundColor: "#fff",
    padding: "12px",
    borderRadius: "10px", 
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.05)",
    border: "1px solid #ddd", 
    minWidth: "320px",
  };

  const buttonDisabledStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: "#cccccc",
    cursor: "not-allowed"
  };

  const errorStyle: React.CSSProperties = {
    color: "red",
    marginTop: "10px",
    fontSize: "14px"
  };

  const logowrapper: React.CSSProperties = {
    paddingTop: "4%", paddingBottom: "2%",
    position: "relative",
    width: "48px",
    height: "48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 20%),
                      radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 40%),
                      radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%),
                      radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 80%)`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundSize: "100% 100%, 80% 80%, 60% 60%, 40% 40%",
    borderRadius: "50%",
  };

  const logo: React.CSSProperties ={
    zIndex: 1,
    width: "48px",
    height: "48px"
  }

  return (
    <div className="bg-auth">
      <div style={logowrapper} data-testid="login-logo">
        <img style={logo} src={require("../../../assets/Logomark.png")} alt="Inji Web Logo" />
      </div>

      <div data-testid="login-title" className="text-3xl text-black font-semibold w-[25%] text-center py-4">
        {t("login-title")}
      </div>
      <div data-testid="login-description" className="my-6 text-base font-light w-[30%] text-ellipsis text-center pb-4">
        {t("login-description")}
      </div>

      <button
        onClick={handleGoogleLogin}
        disabled={isLoading}
        style={isLoading ? buttonDisabledStyle : wrapperStyle}
        data-testid="google-login-button"
      >
        <div style={buttonStyle}>
          <FcGoogle size={24} />{isLoading ? t("logging-in") : t("continue-with-google")}
        </div>
      </button>
      {error && <p style={errorStyle} data-testid="login-error">{error}</p>}
    </div>
  );
};

export default Login;
