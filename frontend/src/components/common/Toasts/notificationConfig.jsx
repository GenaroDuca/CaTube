import '../../../styles/Global_components.css';

export const NOTIFICATION_TYPES = {
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
};

export const NOTIFICATION_CONFIG = {
  [NOTIFICATION_TYPES.SUCCESS]: {
    type: 'success',
    autoClose: 5000,
    theme: 'colored',
    style: {
      backgroundColor: '#90B484',
      color: '#1a1a1b',
      borderRadius: '20px',
      overflow: 'hidden',
      padding: '10px',
    },
  },
  [NOTIFICATION_TYPES.ERROR]: {
    type: 'error',
    autoClose: 5000,
    theme: 'colored',
    style: {
      backgroundColor: '#fcc4c4',
      color: '#1a1a1b',
      borderRadius: '20px',
      overflow: 'hidden',
      padding: '10px',
    },
  },
};