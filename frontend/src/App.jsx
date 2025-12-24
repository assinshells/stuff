import { ServerStatus } from "./widgets/ServerStatus/ServerStatus";
import "./App.css";

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Fullstack Application</h1>
        <p>Production-ready MERN Stack with clean architecture</p>
      </header>

      <main className="app-main">
        <ServerStatus />
      </main>

      <footer className="app-footer">
        <p>Built with Node.js, Express, MongoDB, and React</p>
      </footer>
    </div>
  );
}

export default App;
