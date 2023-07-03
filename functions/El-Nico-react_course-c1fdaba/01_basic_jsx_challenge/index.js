
function Header(){
  return(
    <header >
        <nav className="nav">
          <img src="https://source.unsplash.com/random/?react,logo" className="logo-img"/>
          <ul className="nav-items">
            <li>pricing</li>
            <li>About</li>
            <li>Contact</li>
          </ul>
        </nav>
      </header>
  )
}
function MainContent(){
  return (
    <div>
      <Header />
      <Content />
      <Footer/>
    </div>
  )
}

function Content(){
  return(
    <div>
      <h1>Reasons Why I Love React</h1>
      <ol>
        <li>Easy to Learn</li>
        <li>Composable</li>
        <li>Declarative</li>
      </ol>
    </div>
    
  )
}

function Footer(){
  return(
    <footer>
        <small>&copy; 2023 Eruba development. All rights reserved.</small>
    </footer>
  )
}

ReactDOM.render(<MainContent />, document.getElementById('root'))