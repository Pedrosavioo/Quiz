import { useUser } from "./contexts/userContext";
import Login from "./pages/Login";
import Quiz from "./pages/Quiz";

function App() {
   const { username } = useUser();

   return <main className="App">{username ? <Quiz /> : <Login />}</main>;
}

export default App;
