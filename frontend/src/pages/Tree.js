import React, { useState, useEffect } from 'react';
import Modal_send from '../components/Modal_send';
import Header from "../components/Header";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Tree.css";
import Plus from '../components/Plus';
import before from "../img/before.png";
import after from "../img/after.png";
import ornament25 from "../img/ornament25.png";

function Tree() {
   // 모달창 노출 여부 state
    const [modalOpen, setModalOpen] = useState(false);

    // 모달창 노출
    const showModal = (event) => {
        event.stopPropagation();
        setModalOpen(true);
    };
  
  const [ornamentOrder, setOrnamentOrder] = useState([]);
  const [sliceStart, setSliceStart] = useState(0);
  const [receiver, setReceiver] = useState("");
  const [posts, setPosts] = useState([]);
  const [leftBtnVisible, setLeftBtnVisible] = useState(false);
  const [rightBtnVisible, setRightBtnVisible] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  const { accessToken } = location.state || { accessToken: null };

  useEffect(() => {
    const fetchOrnamentOrder = async () => {
      try {
        console.log("Fetching user information...");
        const response = await axios.get("http://localhost:8080/api/users/user-info", {
          withCredentials: true,
        });
    
        setOrnamentOrder(response.data.ornament);
        setReceiver(response.data.receiver);
        //console.log(response.data.ornament);

        const postsResponse = await axios.get("http://localhost:8080/api/users/readposts", {
          withCredentials: true,
        });
        // date 속성이 있는 게시물을 필터링
        const postsWithDate = postsResponse.data.filter(post => post.date);
        setPosts(postsWithDate);
        // console.log(postsWithDate);

      } catch (error) {
        console.error("Error fetching user information", error);
      }
    };    
    fetchOrnamentOrder();
  }, []);

  const renderDateOrnaments = () => {
    const dateOrnaments = [];
    posts.forEach((post, index) => {
      const ornamentIndex = ornamentOrder[post.date - 1];
      // console.log(post.date);
      // console.log(ornamentIndex);
      dateOrnaments.push(
        <Plus key={index} image={ornamentIndex} isVisible={true} content={post.content} />
      );
    });
    return dateOrnaments;
  };

  const handleRightBtnClick = () => {
    setSliceStart(prev => {
      if (prev !== 12) {
        setLeftBtnVisible(true);
        setRightBtnVisible(false);
      }
      return 12;
    });
  };
  
  const handleLeftBtnClick = () => {
    setSliceStart(prev => {
      if (prev !== 0) {
        setLeftBtnVisible(false);
        setRightBtnVisible(true);
      }
      return 0;
    });
  };

  const handleClick = () => {
    const post25 = posts.find(post => post.date === 25);
    const contentToPass = post25 ? post25.content : null;

    navigate('/tree/post?image=24', { state: { accessToken, content: contentToPass } });
  };

  return (
    <div className="tree-page">
      <div className="page-bg">
        <div className="center">
          <div className="tree-content">
            <div className='tree-header-box'>
              <Header />
            </div>
            <div className='receiver'>
              <p>To. {receiver}</p>
            </div>
            <div className='tree-bg-box'>
              <div className="tree-bg">
                {sliceStart === 12 && posts.some(post => post.date === 25) && (
                  <div 
                    style={{ position: 'absolute', top: '87%', left: '76%', transform: 'translate(-50%, -50%)', zIndex: '999', cursor: "pointer",}}
                    onClick={handleClick}
                  >
                    <img src={ornament25} alt="오너먼트25" />
                  </div>
                )}
                <div className='tree-left-btn'>
                  {leftBtnVisible ? (
                    <img src={before} alt="이전" onClick={handleLeftBtnClick} style={{cursor: "pointer",}}/>
                  ) : (
                    <div className="transparent-box" style={{ width: '32px', }} />
                  )}
                </div>
                <div className='decoration'>
                  <div className='row-1'>
                    {renderDateOrnaments().slice(sliceStart, sliceStart + 2)}
                  </div>
                  <div className='row-2'>
                    {renderDateOrnaments().slice(sliceStart + 2, sliceStart + 5)}
                  </div>
                  <div className='row-3'>
                    {renderDateOrnaments().slice(sliceStart + 5, sliceStart + 8)}
                  </div>
                  <div className='row-4'>
                    {renderDateOrnaments().slice(sliceStart + 8, sliceStart + 12)}
                  </div>
                </div>
                <div className='tree-right-btn'>
                  {rightBtnVisible ? (
                    <img src={after} alt="다음" onClick={handleRightBtnClick} style={{cursor: "pointer",}}/>
                  ) : (
                    <div className="transparent-box" style={{ width: '32px', }} />
                  )}
                </div>
              </div>
            </div>
            <div className='send-btn' onClick={showModal} style={{cursor: "pointer",}}><p>트리 보내기</p></div>
          </div>
        </div>
      </div>
      {modalOpen && <Modal_send setModalOpen={setModalOpen}/>}
    </div>
  );
}
export default Tree;
