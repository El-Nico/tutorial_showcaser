import logo from "./logo.svg";
import "./App.css";

function App() {
  return (
    <div className="App">
      <header class="header el">
        <h1>Header</h1>
      </header>
      <main class="container">
        <div class="box">1</div>
        <div class="box">2</div>
        <div class="box">3</div>
        <div class="box">4</div>
        <div class="box">5</div>
        <div class="box">6</div>
      </main>
      <aside class="sidebar el">
        <h2>Sidebar</h2>
      </aside>
      <footer class="footer el">
        <h2>Footer</h2>
      </footer>
    </div>
  );
}

export default App;
