import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../utils/api";
import { useCookies } from "react-cookie";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { SolidButton } from "../../components/Common/Buttons/SolidButton";

export const PinPage: React.FC = () => {
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

// Auto focus - to switch focus automatically to next input box.
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
      const logo: React.CSSProperties ={
        zIndex: 1,
        width: "48px",
        height: "48px"
      }

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
            className="w-12 h-12 text-center border border-gray-300 rounded-lg text-lg"
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
        setError("Failed to fetch wallets");
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
    const confirmPin = confirmPasscode.join("");

    if (pin.length !== 6 || confirmPin.length !== 6) {
      setError("Please fill out all 6 digits of both passcodes.");
      setLoading(false);
      return;
    }

    if (pin !== confirmPin) {
      setError("Passcodes do not match.");
      setLoading(false);
      return;
    }

    try {
      if (wallets.length === 0) {
        if (!name) {
          setError("Please enter your name.");
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
          setError(`Failed to create wallet: ${errorData.errorMessage || "Unknown error"}`);
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
      setError("Incorrect PIN. Please try again.");
      localStorage.removeItem("walletId");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-auth min-h-screen flex flex-col items-center justify-center">
      <div className="text-center mb-6">
        <div className="ps-20 px-2">
          <img src={require("../../assets/Logomark.png")} alt="Inji Web Logo"/>
        </div>
        <h1 className="text-2xl font-semibold text-gray-800 p-2 ">
            {wallets.length==0 ?" Set Passcode": "Enter Passcode"} 
        </h1>
        <p className="text-gray-600">Create your 6 digit passcode</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-md text-center">
        <p className="mb-4 text-gray-500 text-sm">
          Make sure you remember the passcode for future login
        </p>
        {wallets.length === 0 && (
          <div className="mb-4">
            <p className="text-sm text-left font-medium text-gray-700 mb-1">Enter Name</p>
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
        )}

        <div className="mb-4">
          <p className="text-sm text-left font-medium text-gray-700 mb-1">Enter Passcode</p>
          {renderInputs("passcode", showPasscode, () => setShowPasscode((prev) => !prev))}
        </div>

        <div className="mb-4">
          <p className="text-sm text-left font-medium text-gray-700 mb-1">Confirm Passcode</p>
          {renderInputs("confirm", showConfirm, () => setShowConfirm((prev) => !prev))}
        </div>

        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        <SolidButton testId="Header-Menu-Auth-Button" onClick={handleSubmit}
            title={loading ? "Submitting..." : "Submit"} /> 
      </div>
    </div>
  );
};

export default PinPage
