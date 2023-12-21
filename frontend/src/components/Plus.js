import React from 'react';
import { useNavigate, useLocation } from "react-router-dom";

const ornamentImages = [require("../img/ornament_big1.png"), require("../img/ornament_big2.png"), require("../img/ornament_big3.png"), require("../img/ornament_big4.png"), require("../img/ornament_big5.png"), require("../img/ornament_big6.png"), require("../img/ornament_big7.png"), require("../img/ornament_big8.png"), require("../img/ornament_big9.png"), require("../img/ornament_big10.png"), require("../img/ornament_big11.png"), require("../img/ornament_big12.png"), require("../img/ornament_big13.png"), require("../img/ornament_big14.png"), require("../img/ornament_big15.png"), require("../img/ornament_big16.png"), require("../img/ornament_big17.png"), require("../img/ornament_big18.png"), require("../img/ornament_big19.png"), require("../img/ornament_big20.png"), require("../img/ornament_big21.png"), require("../img/ornament_big22.png"), require("../img/ornament_big23.png"), require("../img/ornament_big24.png"), require("../img/ornament_big25.png")];

function Plus({image, content }) {

    const navigate = useNavigate();
    const location = useLocation();

    const { accessToken } = location.state || { accessToken: null };

    const handleClick = () => {
        navigate(`/tree/post?image=${image}`, { state: { accessToken, content} });
    };

    const currentUrl = window.location.href;
    const urlNumberMatch = currentUrl.match(/(\d+)$/);
    const currentUrlNumber = urlNumberMatch ? parseInt(urlNumberMatch[1]) : null;

    const dynamicImageIndex = currentUrlNumber === 24 ? 25 : image;

    // console.log(currentUrlNumber);
    console.log(dynamicImageIndex);

    return (
        <div
            style={{
            width: "60px",
            height: "60px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            }}
            onClick={handleClick}
        >
            <img
            src={ornamentImages[dynamicImageIndex]}
            style={{
                height: "60px",
            }}
            alt='오너먼트'
            />
        </div>
    );
}
    
export default Plus;
    