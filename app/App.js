import { Provider } from "react-redux";
import BareProvider from "./src/component/BareProvider";
import HomeScreen from "./src/screen/HomeScreen";
import store from "./src/store/store";
import { rpcHandler } from "./src/lib/rpc";
import { Text } from "react-native";

export default function App() {
  return (
    <Provider store={store}>
      <BareProvider rpcHandler={rpcHandler}>
        <HomeScreen />
      </BareProvider>
    </Provider>
  );
}
