import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "../components/Header";
import "../styles/Post.css";

const ornamentImages = [require("../img/ornament_big1.png"), require("../img/ornament_big2.png"), require("../img/ornament_big3.png"), require("../img/ornament_big4.png"), require("../img/ornament_big5.png"), require("../img/ornament_big6.png"), require("../img/ornament_big7.png"), require("../img/ornament_big8.png"), require("../img/ornament_big9.png"), require("../img/ornament_big10.png"), require("../img/ornament_big11.png"), require("../img/ornament_big12.png"), require("../img/ornament_big13.png"), require("../img/ornament_big14.png"), require("../img/ornament_big15.png"), require("../img/ornament_big16.png"), require("../img/ornament_big17.png"), require("../img/ornament_big18.png"), require("../img/ornament_big19.png"), require("../img/ornament_big20.png"), require("../img/ornament_big21.png"), require("../img/ornament_big22.png"), require("../img/ornament_big23.png"), require("../img/ornament_big24.png"), require("../img/ornament_big25.png")];

function TreePost() {

    const location = useLocation();
    const [image, setImage] = useState(null);
    const [content, setContent] = useState(null);

    useEffect(() => {
        const imageQuery = location.search.match(/\d+/);
        if (imageQuery) {
            const imageIndex = parseInt(imageQuery[0], 10);
            setImage(imageIndex);
            console.log(imageIndex);
        }

        if (location.state && location.state.content) {
            setContent(location.state.content);
        }

    }, [location.search, location.state]);


    return (
        <div className="tree-page">
        <div className="page-bg">
            <div className="center">
            <div className="post-content">
                <Header />
                <div className="white-door-post">
                <div className="ribbon">
                    <img src={ornamentImages[image]} alt="리본" />
                </div>
                <div className="post-title">
                    <p>소중한 이야기를 확인해보세요</p>
                </div>
                <div className="post-write">
                    <div className="post-form">
                    <div className="write-content">
                        <div className='read-content'>
                            <p>{content}</p>
                        </div>
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

export default TreePost;
