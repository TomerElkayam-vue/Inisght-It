import React from "react";
import logoDark from "../../assets/logo-dark.png";

const Logo: React.FC = () => {
  return (
    <div className="flex flex-col items-center mb-16">
      <div className="flex items-center justify-center gap-4 mb-4">
        <img 
          src={logoDark} 
          alt="Insight IT Logo" 
          className="h-32 w-auto"
        />
      </div>
    </div>
  );
};

export default Logo; 