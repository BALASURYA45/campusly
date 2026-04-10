import NetInfo from '@react-native-community/netinfo';

export const checkNetworkStatus = async () => {
  const state = await NetInfo.fetch();
  return state.isConnected && state.isInternetReachable !== false;
};

export const subscribeToNetworkChanges = (callback) => {
  return NetInfo.addEventListener(state => {
    const isOnline = state.isConnected && state.isInternetReachable !== false;
    callback(isOnline);
  });
};
