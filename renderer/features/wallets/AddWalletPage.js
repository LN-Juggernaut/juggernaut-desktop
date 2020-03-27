import { connect } from 'react-redux';
import AddWallet from './AddWallet';
import { addWallet } from './walletsSlice';

export default connect(null, { addWallet })(AddWallet);
