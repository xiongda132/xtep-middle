import "./App.css";
import WebSiteLog from "./layout/LeftNav/WebSiteLog";
import LeftNav from "./layout/LeftNav";
import {
  BrowserRouter as Router,
  Switch,
  Redirect,
  Route,
} from "react-router-dom";
import Inventory from "./views/Inventory";
import Seek from "./views/Seek";

function App() {
  return (
    <div className="App">
      <Router>
        <section className="section-left">
          <aside className="aside">
            <WebSiteLog></WebSiteLog>
            <LeftNav></LeftNav>
          </aside>
          <section className="section-right">
            <header className="top">
              <div style={{ backgroundColor: "white", height: "64px" }}></div>
            </header>
            <main className="main">
              <div
                style={{
                  boxSizing: "border-box",
                  padding: "15px",
                  height: "100%",
                }}
              >
                <Switch>
                  <Route path="/inventory" component={Inventory}></Route>
                  <Route path="/seek" component={Seek}></Route>
                  <Redirect exact from="/" to="/seek"></Redirect>
                </Switch>
              </div>
            </main>
          </section>
        </section>
      </Router>
    </div>
  );
}

export default App;
