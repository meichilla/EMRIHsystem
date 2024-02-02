'use client'
import { useRef, useState } from 'react';
import { MuiOtpInput } from 'mui-one-time-password-input'
import React from 'react';

const OTPInput = () => {
  const [otp, setOTP] = useState('');
  const inpRefs = useRef(null);

  const handleSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    // Process the OTP here, e.g., send it to the server for verification
    console.log('OTP:', otp);
  };

  const handleChange = (newValue: any) => {
    setOTP(newValue)
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-2/3 p-6 shadow-md">
        <h2 className="text-2xl text-center font-bold mb-4">Enter OTP Verification</h2>
        <h2 className="text-1xl text-center mb-8">We have sent you access code via Email to verify your account</h2>
        <form onSubmit={handleSubmit}>
          {/* <input
            type="text"
            className="w-full px-4 py-2 mb-4 border border-gray-400 rounded-md"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOTP(e.target.value)}
          /> */}
          <MuiOtpInput className="mb-8" value={otp} onChange={handleChange} />
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Verify OTP
          </button>
        </form>
      </div>
    </div>
  );
};


export default OTPInput;