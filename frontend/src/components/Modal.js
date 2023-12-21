import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Modal.css";

function Modal({ onClose, boxNumber, boxDate }) {
  const [ornamentImage, setOrnamentImage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // 이전 페이지에서 전달받은 토큰 값을 추출
  const { accessToken } = location.state || { accessToken: null };

  useEffect(() => {
    // 박스 번호에 해당하는 이미지 설정
    setOrnamentImage(boxNumber || "/path/to/default/image"); // 만약 boxNumber가 falsy하면 기본 이미지 경로를 사용합니다

    const timeoutId = setTimeout(() => {
      onClose();

      // 1.5초 후에 "/main/post"로 리다이렉트
      // accessToken을 state로 전달
      navigate("/main/post", { state: { accessToken, boxNumber, boxDate } });
    }, 1500);

    return () => clearTimeout(timeoutId);
  }, [onClose, boxNumber, boxDate, navigate]);

  return (
    <div className="modal-overlay">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* <p>박스 번호: {boxNumber}</p> */}
        <img src={ornamentImage} alt="Ornament" />
        {/* 필요에 따라 내용이나 스타일을 추가하세요 */}
      </div>
    </div>
  );
}

export default Modal;
