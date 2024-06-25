import React from "react";

const Container: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      backgroundColor: '#fafafa',
      boxShadow: '0 2px 4px 0 rgba(0,0,0,0.1)',
      border: '1px solid #efefef',
      borderRadius: 6,
      padding: '16px 16px 1px',
      marginBottom: '32px',
    }}
  >
    {children}
  </div>
);

export default Container
