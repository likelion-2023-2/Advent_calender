import { Link } from "react-router-dom";
import "../styles/Start.css";
import Title from "../img/title.png";

function Start() {
  return (
    <div className="start-page">
      <div className="white-door">
        <div className="center">
          <div className="start-content">
            <div className="start-bg">
              <div className="title">
                <img src={Title}/>
              </div>
              <div className="start-btn">
                <div className="login-btn">
                  <Link to="/Login"><p>로그인</p></Link>
                </div>
                <div className="register-btn">
                  <Link to="/Register"><p>회원가입</p></Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Start;