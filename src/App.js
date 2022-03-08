import './App.css';
import Dashboard from "./components/Dashboard/Dashboard";
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import Login from "./components/Login/Login";
import useToken from "./components/App/useToken";

function App() {
    const { token, setToken } = useToken();

    if(!token){
        return <Login setToken={setToken}/>
    }

    return (
        <div className="wrapper">
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Dashboard/>}/>
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
