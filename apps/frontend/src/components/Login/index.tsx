import React from "react";
import Logo from "./Logo";
import LoginForm from "./LoginForm";

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#151921] flex items-center justify-center">
      <div className="w-full max-w-md px-4 py-8">
        <Logo />
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage; 