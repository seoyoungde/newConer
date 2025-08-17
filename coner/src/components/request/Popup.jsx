import React from "react";
import styled from "styled-components";
import ReactDOM from "react-dom";

const PopupOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 9999;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5); // 배경 어둡게
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PopupContainer = styled.div`
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  max-width: 90%;
  min-width: 280px;
  text-align: center;a
`;

const Popup = ({ children, onClose }) => {
  return ReactDOM.createPortal(
    <PopupOverlay onClick={onClose}>
      <PopupContainer onClick={(e) => e.stopPropagation()}>
        {children}
      </PopupContainer>
    </PopupOverlay>,
    document.getElementById("popup-root")
  );
};

export default Popup;
