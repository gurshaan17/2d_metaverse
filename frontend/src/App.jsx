import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './components/Home';
import Space from './components/Space';
import {KindeProvider} from "@kinde-oss/kinde-auth-react";
import MySpace from './components/Myspace';
import { createBrowserRouter } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Homepage />,
  },
  {
    path: '/space',
    element: <MySpace />,
  },
  {
    path: '/myspace',
    element: <Space />,
  },
]);

const App = () => {
  const frontendUrl = import.meta.env.VITE_FRONTENDURL || "https://metaverse.gurshaan.xyz/";
  console.log(import.meta.env.VITE_CLIENT_ID);
  return (
    <KindeProvider
		clientId={import.meta.env.VITE_CLIENT_ID}
		domain={import.meta.env.VITE_DOMAIN}
		redirectUri={new URL('/space', frontendUrl).href}
		logoutUri={new URL('/', frontendUrl).href}
	>
    <Router router={router}>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path='/space' element={<MySpace />} />
        <Route path="/myspace" element={<Space />} />
       </Routes>
    </Router>
    </KindeProvider>
  );
};

export default App;