import "./App.css";
import { Link } from "react-router";


function App() {
  return (
    <div className="container">
      <h1 className="title">
        Admin <br />
        <span>Kitchen Sink</span>
      </h1>
      <p className="description">
        <Link to="/blog">Go to blog</Link>
      </p>
    </div>
  );
}

export default App;
