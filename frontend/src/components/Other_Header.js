import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
// import "../styles/Header.css";

import back from "../img/back.png";
import ticket from "../img/ticket.png";

function Header() {
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

  const handleMainLink = () => {
    navigate("/main", { state: { accessToken } });
  };

  return (
    <div className="Header">
      <div className="hd-img">
        <div className="setting-ticket">
          <img src={back} alt="뒤로가기" onClick={handleMainLink} />
          <div className="ticket-box">
            <div className="ticket-img">
              <img src={ticket} alt="티켓" />
            </div>
            <p>{ticketCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
