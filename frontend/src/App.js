import { BrowserRouter, Routes, Route } from "react-router-dom";
import Start from "./pages/Start";
import Register from "./pages/Register";
import Login from "./pages/Login";
import MyPage from "./pages/MyPage";
import Main from "./pages/Main";
import Tree from "./pages/Tree";
import Post from "./pages/Post";
import TreePost from "./pages/TreePost";

import "./styles/App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route exact path="/" element={<Start />} />
          <Route exact path="/register" element={<Register />} />
          <Route exact path="/login" element={<Login />} />
          <Route exact path="/mypage" element={<MyPage />} />

          {/* 오너먼트 */}
          <Route exact path="/main" element={<Main />} />
          <Route exact path="/main/post" element={<Post />} />

          {/* 트리 */}
          <Route exact path="/tree" element={<Tree />} />
          <Route exact path="/tree/post" element={<TreePost />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
