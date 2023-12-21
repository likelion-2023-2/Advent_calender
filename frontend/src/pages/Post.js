import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Post_Header from "../components/Post_Header";
import "../styles/Post.css";
import ribbon from "../img/ribbon.png";

function Post() {
  const [postData, setPostData] = useState({
    content: "",
  });

  const [ornamentImage, setOrnamentImage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // 이전 페이지에서 전달받은 토큰과 boxNumber 값을 추출
  const { accessToken, boxNumber, boxDate } = location.state || { accessToken: null, boxNumber: null, boxDate: null };

  const [userToken, setUserToken] = useState(accessToken);
  const [ticketCount, setTicketCount] = useState(0);

  useEffect(() => {
    // 박스 번호에 해당하는 이미지 설정
    setOrnamentImage(boxNumber || "/path/to/default/image"); // 만약 boxNumber가 falsy하면 기본 이미지 경로를 사용합니다
  }, [boxNumber]);

  useEffect(() => {
    const fetchTicketCount = async () => {
      try {
        if (!userToken) {
          console.error("Access token is missing");
          return;
        }

        const response = await axios.get("http://localhost:8080/api/users/user-info", {
          withCredentials: true,
        });

        // ticketCount 상태 업데이트
        setTicketCount(response.data.ticket);
      } catch (error) {
        console.error("Error fetching ticket count", error);
      }
    };

    fetchTicketCount();
  }, [userToken]);

  const getCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return { year, month, day };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPostData({ ...postData, [name]: value });
  };

  const handleSubmit = async () => {
    const { year, month, day } = getCurrentDate(); // Destructure the returned object
    const formattedDay = day.replace(/^0+/, "");
    const currentDate = `${year}-${month}-${formattedDay}`;

    try {
      // 이 부분에서 티켓 사용 여부를 체크
      const today = new Date();
      const formattedDay = parseInt(day, 10);
      const isToday = formattedDay === today.getDate();
      const isPastDate = boxDate < today.getDate();
      const canUseTicket = ticketCount > 0; // ticketCount는 티켓 개수

      // 티켓 사용 여부에 따라 API URL 결정
      let apiUrl = null;

      if (canUseTicket && isPastDate) {
        // 티켓이 있고 과거 날짜인 경우 (티켓을 사용하여 과거 오너먼트에 작성)
        apiUrl = `http://localhost:8080/api/users/ticket/post/${boxDate}`;
      } else if (canUseTicket && isToday) {
        // 티켓이 있고 오늘인 경우 (티켓을 사용하지 않고 오늘 날짜에 작성)
        apiUrl = `http://localhost:8080/api/users/post/${formattedDay}`;
      } else if (!canUseTicket && isToday) {
        // 티켓이 없고 오늘인 경우 (오늘 날짜에 작성)
        apiUrl = `http://localhost:8080/api/users/post/${formattedDay}`;
      }

      // console.log("API URL:", apiUrl);

      if (!apiUrl) {
        console.error("Invalid API URL");
        return;
      }

      const response = await axios.post(apiUrl, postData, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });

      // 서버로부터의 응답을 확인하고 필요한 작업 수행
      console.log(response.data);

      // main 페이지로 navigate 할 때 accessToken을 전달
      navigate("/main", { state: { accessToken, ticketCount } });
    } catch (error) {
      // 오류 처리
      console.error("Error submitting post:", error);
    }
  };

  return (
    <div className="main-page">
      <div className="page-bg">
        <div className="center">
          <div className="post-content">
            <Post_Header />
            <div className="white-door-post">
              <div className="ribbon">
                <img src={ornamentImage || ribbon} alt="리본" />
              </div>
              <div className="post-title">
                <p>이야기를 담아주세요</p>
              </div>
              <div className="post-write">
                <div className="post-form">
                  <div className="write-content">
                    <textarea name="content" placeholder="담길 이야기" onChange={handleInputChange}></textarea>
                  </div>
                  <input type="hidden" name="currentDate" value={getCurrentDate()} />
                  <div className="submit-btn">
                    <button onClick={handleSubmit}>담기</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Post;
