import React from "react";
import Logo from "../Login/Logo";
import RegisterForm from "./RegisterForm";

const RegisterPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#151921] flex items-center justify-center">
      <div className="w-full max-w-md px-4 py-8">
        <Logo />
        <RegisterForm />
      </div>
    </div>
  );
};

export default RegisterPage; 