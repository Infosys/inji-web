import { FaExclamationCircle } from "react-icons/fa";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../utils/api";
import { useCookies } from "react-cookie";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { SolidButton } from "../../components/Common/Buttons/SolidButton";
import { useTranslation } from "react-i18next";

export const PinPage: React.FC = () => {
  const { t, i18n } = useTranslation("PinPage");
  const navigate = useNavigate();
  const [name, setName] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [wallets, setWallets] = useState<any[]>([]);
  const [walletId, setWalletId] = useState<string | null>(null);
  const [cookies] = useCookies(["XSRF-TOKEN"]);
  
  const [passcode, setPasscode] = useState<string[]>(Array(6).fill(""));
  const [showPasscode, setShowPasscode] = useState(false);

  const [confirmPasscode, setConfirmPasscode] = useState<string[]>(Array(6).fill(""));
  const [showConfirm, setShowConfirm] = useState(false);

  const [isPinCorrect, setIsPinCorrect] = useState<boolean | null>(null);

  const passcodeRefs = useRef<(HTMLInputElement | null)[]>([]);
  const confirmPasscodeRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleInputChange = (
    index: number,
    value: string,
    type: "passcode" | "confirm"
  ) => {
    if (!/\d/.test(value) && value !== "") return;

    const refs = type === "passcode" ? passcodeRefs : confirmPasscodeRefs;
    const values = type === "passcode" ? [...passcode] : [...confirmPasscode];
    values[index] = value;

    if (type === "passcode") {
      setPasscode(values);
    } else {
      setConfirmPasscode(values);
    }

    if (value && index < 5) {
      refs.current[index + 1]?.focus();
    } 
  };

  const renderInputs = (
    type: "passcode" | "confirm",
    visible: boolean,
    toggleVisibility: () => void
  ) => {
    const values = type === "passcode" ? passcode : confirmPasscode;
    const refs = type === "passcode" ? passcodeRefs : confirmPasscodeRefs;
    
    return (
      <div className="flex items-center gap-2">
        {values.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => (refs.current[idx] = el)}
            type={visible ? "text" : "password"}
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleInputChange(idx, e.target.value, type)}
            onKeyDown={(e) => {
              if (e.key === 'Backspace' && idx > 0 && !digit) {
                refs.current[idx - 1]?.focus();
              }
            }}
            className="w-10 h-10 text-center border border-gray-300 rounded-sm text-sm"
          />
        ))}
        <button type="button" onClick={toggleVisibility} className="px-5">
          {visible ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
    );
  };

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const response = await fetch(api.fetchWallets.url(), {
          method: api.fetchWallets.methodType === 0 ? "GET" : "POST",
          headers: api.fetchWallets.headers(),
          credentials: "include"
        });

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData);
        }

        setWallets(responseData);
        if (responseData.length > 0) {
          setWalletId(responseData[0].walletId);
          localStorage.setItem("walletId", responseData[0].walletId);
        }
      } catch (error) {
        console.error("Error occurred while fetching wallets:", error);
        setError(t("fetch-wallets-error"));
      }
    };

    fetchWallets();
  }, []);

  const fetchWalletDetails = async (walletId: string, pin: string) => {
    try {
      const response = await fetch(api.fetchWalletDetails.url(walletId), {
        method: api.fetchWalletDetails.methodType === 0 ? "GET" : "POST",
        headers: {
          ...api.fetchWalletDetails.headers(),
          "X-XSRF-TOKEN": cookies["XSRF-TOKEN"]
        },
        credentials: "include",
        body: JSON.stringify({ walletPin: pin })
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw responseData;
      }
      return responseData.walletId;
    } catch (error) {
      console.error("Error occurred while fetching wallet details:", error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    setIsPinCorrect(null);
    const pin = passcode.join("");
   
    if(wallets.length !== 0) {
      if(pin.length !== 6){
        setError(t("pin-length-error"));
        setLoading(false);
        return;
      }
    } else {       
      const confirmPin = confirmPasscode.join("");
      if (pin.length !== 6 || confirmPin.length !== 6) {
        setError(t("pin-length-error"));
        setLoading(false);
        return;
      }

      if (wallets.length === 0 && pin !== confirmPin) {
        setError(t("passcode-mismatch-error"));
        setLoading(false);
        return;
      }  
    }

    try {
      if (wallets.length === 0) {
        if (!name) {
          setError(t("enter-name-error"));
          setLoading(false);
          return;
        }

        const response = await fetch(api.createWalletWithPin.url(), {
          method: "POST",
          headers: {
            ...api.createWalletWithPin.headers(),
            "Content-Type": "application/json",
            "X-XSRF-TOKEN": cookies["XSRF-TOKEN"]
          },
          credentials: "include",
          body: JSON.stringify({ walletPin: pin, walletName: name })
        });

        if (!response.ok) {
          const errorData = await response.json();
          setError(`${t("create-wallet-error")}: ${errorData.errorMessage || t("unknown-error")}`);
          setIsPinCorrect(false);
          return;
        }

        const newWalletId = await response.text();
        setWalletId(newWalletId);
        setWallets([{ walletId: newWalletId }]);
        setIsPinCorrect(true);
        localStorage.setItem("walletId", newWalletId);
        navigate("/issuers");
      } else {
        const walletData = await fetchWalletDetails(walletId!, pin);
        setIsPinCorrect(true);
        localStorage.setItem("walletId", walletData);
        navigate("/issuers");
      }
    } catch (error) {
      setIsPinCorrect(false);
      setError(t("incorrect-pin-error"));
      localStorage.removeItem("walletId");
    } finally {
      setLoading(false);
    }
  };

  const isButtonDisabled = passcode.includes("") || (wallets.length === 0 && confirmPasscode.includes(""));
  return (
    <div className="bg-auth min-h-screen flex flex-col items-center justify-center pt-1" data-testid="pin-page">
      <div className="text-center mb-2">
        <div className="ps-20" data-testid="pin-logo">
          <img src={require("../../assets/Logomark.png")} alt="Inji Web Logo"/>
        </div>
        <h1 className="text-2xl font-semibold text-gray-800 p-4 " data-testid="pin-title">
            {wallets.length === 0 ? t("set-passcode") : t("enter-passcode")}
        </h1>
        <p className="text-gray-600 text-md" data-testid="pin-description">
          {t("pin-description")}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 max-w-sm text-center" data-testid="pin-container">
        <p className="text-center mx-10 my-2 w-[85%] text-gray-500 text-sm" data-testid="pin-warning">
          {t("pin-warning")}
        </p>
        {error && 
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-lg mb-4 flex items-center justify-between" data-testid="pin-error">
          <div className="flex items-center gap-2">
            <FaExclamationCircle className="text-red-500 w-4 h-4" />
            <span className="w-full text-xs">{error}</span>
          </div>
        </div>
        }

        {wallets.length === 0 && (
          <div className="mb-2" data-testid="pin-name-input">
            <p className="text-sm text-left text-gray-700 mb-1">{t("enter-name")}</p>
            <input
              type="text"
              placeholder={t("placeholder-name")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-2 py-1"
            />
          </div>
        )}

        <div className="mb-2" data-testid="pin-passcode-input">
          <p className="text-sm text-left font-small text-gray-700 mb-1">{t("enter-passcode")}</p>
          {renderInputs("passcode", showPasscode, () => setShowPasscode((prev) => !prev))}
        </div>

        {wallets.length === 0 && (
          <div className="mb-2" data-testid="pin-confirm-passcode-input">
            <p className="text-sm text-left font-small text-gray-700 mb-1">{t("confirm-passcode")}</p>
            {renderInputs("confirm", showConfirm, () => setShowConfirm((prev) => !prev))}
          </div>
        )}

        <SolidButton
          fullWidth={true}
          testId="pin-submit-button"
          onClick={handleSubmit}
          title={loading ? t("submitting") : t("submit")}
          disabled={isButtonDisabled}
          className={`${isButtonDisabled ? 'grayscale' : ''}`}
        />
      </div>
    </div>
  );
};

export default PinPage;
