import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "../styles/Main_Header.css";

import logout from "../img/logout.png";
import setting from "../img/settings.png";
import ticket from "../img/ticket.png";

function Main_Header() {
  const navigate = useNavigate();
  const [ticketCount, setTicketCount] = useState(0);

  const location = useLocation();
  const { accessToken } = location.state || { accessToken: null };

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        // 유저 정보 가져오기 API 호출
        const response = await axios.get("http://localhost:8080/api/users/user-info");
        const userTicketCount = response.data.ticket; // 티켓 개수 추출
        setTicketCount(userTicketCount);
      } catch (error) {
        console.error("유저 정보 가져오기 에러:", error);
      }
    };

    fetchUserInfo();
  }, []);

  const handleLogout = async () => {
    try {
      // 로그아웃 API 호출
      await axios.delete("http://localhost:8080/api/users/logout");
      console.log("User logout is successful");

      // Clear authentication tokens from local storage
      localStorage.removeItem("accessToken");

      // Reset Authorization header
      delete axios.defaults.headers.common["Authorization"];

      // Redirect to the login page
      navigate("/"); // 로그인 페이지의 경로로 변경 가능
    } catch (error) {
      console.error("로그아웃 에러:", error);
    }
  };

  const handleMypageLink = () => {
    navigate("/mypage", { state: { accessToken } });
  };

  return (
    <div className="Header">
      <div className="hd-img">
        <div className="setting-ticket">
          <img src={setting} alt="설정" onClick={handleMypageLink} style={{cursor: "pointer",}}/>
          <div className="ticket-box">
            <div className="ticket-img">
              <img src={ticket} alt="티켓" />
            </div>
            <p>{ticketCount}</p>
          </div>
        </div>
        <img src={logout} alt="로그아웃" onClick={handleLogout} style={{cursor: "pointer",}}/>
      </div>
    </div>
  );
}

export default Main_Header;
