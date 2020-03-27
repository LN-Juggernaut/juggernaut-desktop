import React from 'react';
import { useHistory } from 'react-router-dom';
import routes from '../../constants/routes.json';
import JuggernautLogo from '../images/JuggernautLogo';

const Home = () => {
  const history = useHistory();

  setTimeout(() => {
    history.push(routes.WALLETS);
  }, 2500);

  return (
    <div style={{ textAlign: 'center', width: '100%' }}>
      <JuggernautLogo width="550px" height="550px" />
    </div>
  );
};

export default Home;
