import React, { useState, useEffect } from "react";
import axios from "axios";
import Main_Header from "../components/Main_Header";
import { useLocation, useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import "../styles/Main.css";

const ornamentImages = [require("../img/ornament_big1.png"), require("../img/ornament_big2.png"), require("../img/ornament_big3.png"), require("../img/ornament_big4.png"), require("../img/ornament_big5.png"), require("../img/ornament_big6.png"), require("../img/ornament_big7.png"), require("../img/ornament_big8.png"), require("../img/ornament_big9.png"), require("../img/ornament_big10.png"), require("../img/ornament_big11.png"), require("../img/ornament_big12.png"), require("../img/ornament_big13.png"), require("../img/ornament_big14.png"), require("../img/ornament_big15.png"), require("../img/ornament_big16.png"), require("../img/ornament_big17.png"), require("../img/ornament_big18.png"), require("../img/ornament_big19.png"), require("../img/ornament_big20.png"), require("../img/ornament_big21.png"), require("../img/ornament_big22.png"), require("../img/ornament_big23.png"), require("../img/ornament_big24.png"), require("../img/ornament_big25.png")];

function Main() {
  const boxNumbers = Array.from({ length: 25 }, (_, index) => index + 1);
  const chunkedBoxNumbers = [];
  for (let i = 0; i < boxNumbers.length; i += 5) {
    chunkedBoxNumbers.push(boxNumbers.slice(i, i + 5));
  }

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [modalNumContent, setModalNumContent] = useState(null);
  const [currentDate, setCurrentDate] = useState("");
  const [apiDates, setApiDates] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();

  const { accessToken } = location.state || { accessToken: null };

  // accessToken을 state로 관리
  const [userToken, setUserToken] = useState(accessToken);
  const [userOrnamentOrder, setUserOrnamentOrder] = useState([]);
  const [openedBoxes, setOpenedBoxes] = useState([]);
  const [ticketCount, setTicketCount] = useState(0);

  useEffect(() => {
    const getCurrentDate = () => {
      const date = new Date();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${month}.${day}`;
    };

    setCurrentDate(getCurrentDate());
  }, []);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        if (!userToken) {
          console.error("Access token is missing");
          return;
        }

        const response = await axios.get("http://localhost:8080/api/users/user-info", {
          withCredentials: true,
        });

        setUserOrnamentOrder(response.data.ornament);
      } catch (error) {
        console.error("Error fetching user information", error);
      }
    };

    fetchUserInfo();
  }, [userToken]);

  useEffect(() => {
    const fetchApiDates = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/users/readposts", {
          withCredentials: true,
        });

        setApiDates(response.data.map((post) => post.date));
      } catch (error) {
        console.error("Error fetching API dates", error);
      }
    };

    fetchApiDates();
  }, []);

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

  const isToday = (boxNumber) => {
    const today = new Date();
    const dayOfMonth = today.getDate();
    return dayOfMonth === boxNumber;
  };

  // 현재 날짜에 따라 상자가 열리는지 확인
  const isBoxOpened = (boxNumber) => {
    const today = new Date();
    const dayOfMonth = today.getDate();

    // 현재 날짜의 상자만 열리도록 확인
    return dayOfMonth === boxNumber && openedBoxes.includes(boxNumber);
  };

  const getBoxClass = (boxNumber) => {
    // 서버에서 받아온 날짜 목록에 해당 상자의 날짜가 포함되어 있으면 투명도를 0으로, 그렇지 않으면 1로 설정
    return apiDates && apiDates.includes(boxNumber) ? "written-date" : "";
  };

  const getBoxContent = (boxNumber) => {
    // 작성된 날짜에 해당하는 박스에 이미지 표시
    if (apiDates.includes(boxNumber)) {
      // userOrnamentOrder 배열에서 해당 상자 번호에 대한 오너먼트 값 찾기
      const ornamentForBox = userOrnamentOrder.find((ornament, index) => index + 1 === boxNumber);

      // 해당 오너먼트 값에 1을 더해서 이미지 인덱스 계산
      const imageIndex = ornamentForBox !== undefined ? ornamentForBox : 0;

      return <img src={ornamentImages[imageIndex]} alt={`ornament-${imageIndex}`} />;
    }
  };

  const canOpenBox = (boxNumber) => {
    const today = new Date();
    const isToday = boxNumber === today.getDate();
    const isPastDate = boxNumber <= today.getDate();
    return (isToday || (ticketCount > 0 && !apiDates.includes(boxNumber))) && isPastDate;
  };

  const openModal = (boxNumber) => {
    if (isToday && apiDates.includes(boxNumber)) {
      return;
    }

    // 박스를 열 수 있는지 확인
    const canOpen = canOpenBox(boxNumber);
    const boxDate = boxNumber;

    if (canOpen) {
      setIsModalOpen(true);

      // const imageIndex = userOrnamentOrder.indexOf(boxNumber) + 1;
      // userOrnamentOrder 배열에서 해당 상자 번호에 대한 오너먼트 값 찾기
      const ornamentForBox = userOrnamentOrder.find((ornament, index) => index + 1 === boxNumber);

      // 해당 오너먼트 값에 1을 더해서 이미지 인덱스 계산
      const imageIndex = ornamentForBox !== undefined ? ornamentForBox : 0;

      // setModalContent({
      //   image: ornamentImages[imageIndex],
      //   boxNumber: boxNumber,
      // });

      setModalContent(ornamentImages[imageIndex]);
      setModalNumContent(boxDate);
      setOpenedBoxes([...openedBoxes, boxNumber]);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent(null);
    setModalNumContent(null);
  };

  // 페이지 간 이동 시에도 토큰을 전달하도록 navigate 함수 사용
  const handleTreeLink = () => {
    navigate("/tree", { state: { accessToken } });
  };

  return (
    <div className="main-page">
      <div className="page-bg">
        <div className="center">
          <div className="main-content">
            <div className="main-hd-center">
              <Main_Header />
            </div>
            <div className="today-date">
              <p>Today</p>
              <p style={{ marginLeft: 20 }}>{currentDate}</p>
            </div>
            <div className="main-calendar-box">
              <div className="main-calendar">
                <div className="boxs">
                  {chunkedBoxNumbers.map((row, rowIndex) => (
                    <div key={rowIndex} className="box-row">
                      {row.map((number) => (
                        <div key={number} className={`box ${isBoxOpened(number) ? "box-opened" : ""} ${canOpenBox(number) ? "can-box-open" : ""} ${getBoxClass(number)} ${number === 24 ? "box-24" : ""} ${number === 25 ? "box-25" : ""}`} onClick={() => openModal(number)}>
                          <div className="box-date">
                            <div className="box-content-container">{getBoxContent(number)}</div>
                            <p>{number}</p>
                          </div>
                          {isBoxOpened(number)}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* handleTreeLink 함수를 사용하여 페이지 간 이동 시 토큰 전달 */}
            <div className="go-tree-btn" onClick={handleTreeLink} style={{cursor: "pointer",}}>
              <p>내 트리 보러가기</p>
            </div>
          </div>
        </div>
      </div>
      {isModalOpen && <Modal onClose={closeModal} boxNumber={modalContent} boxDate={modalNumContent} />}
    </div>
  );
}

export default Main;
