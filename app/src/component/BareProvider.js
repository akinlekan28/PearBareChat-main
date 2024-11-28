import { createContext, useContext, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getBackend } from "../lib/rpc";
import useWorklet from "../hook/useWorklet";
import {
  setConnectionStatus,
  selectRoomTopic,
  selectLastRoom,
  setCurrentRoom,
  setLastRoom,
} from "../store/messageSlice";

const BareApiContext = createContext(null);
const noop = () => {};

export const BareProvider = ({ children, rpcHandler = noop }) => {
  const [backend, setBackend] = useState(null);
  const [worklet, rpc] = useWorklet(rpcHandler);
  const dispatch = useDispatch();
  const currentRoom = useSelector(selectRoomTopic);
  const lastRoom = useSelector(selectLastRoom);

  useEffect(() => {
    let mounted = true;

    const startWorklet = async () => {
      try {
        if (!worklet) {
          console.error("Worklet not initialized");
          return;
        }

        console.log("Starting worklet...");
        await worklet.start("/app.bundle", require("../../worklet/app.bundle"));
        console.log("Worklet started successfully");
        dispatch(setConnectionStatus(true));

        // If we have a lastRoom or currentRoom, try to join it
        const roomToJoin = currentRoom || lastRoom;
        if (roomToJoin) {
          try {
            console.log("Attempting to join room:", roomToJoin);
            await worklet.join(roomToJoin);
            dispatch(setCurrentRoom(roomToJoin));
            console.log("Successfully joined room:", roomToJoin);
          } catch (error) {
            console.error("Failed to join room:", error);
            dispatch(setConnectionStatus(false));
            dispatch(setCurrentRoom(null));
            // Clear the last room if it's invalid
            if (roomToJoin === lastRoom) {
              dispatch(setLastRoom(null));
            }
          }
        }
      } catch (error) {
        console.error("Failed to start worklet:", error);
        if (mounted) {
          dispatch(setConnectionStatus(false));
        }
      }
    };

    startWorklet();

    return () => {
      mounted = false;
      if (worklet) {
        try {
          worklet.terminate();
        } catch (error) {
          console.error("Error terminating worklet:", error);
        }
        dispatch(setConnectionStatus(false));
      }
    };
  }, [worklet, dispatch, lastRoom, currentRoom]);

  useEffect(() => {
    let mounted = true;

    if (!rpc || !worklet) {
      return;
    }

    const initBackend = async () => {
      try {
        const bareBackend = getBackend(rpc, worklet);
        if (mounted) {
          setBackend(bareBackend);
        }
      } catch (error) {
        console.error("Error initializing backend:", error);
      }
    };

    initBackend();

    return () => {
      mounted = false;
      if (backend) {
        backend.cleanup?.();
      }
    };
  }, [rpc, worklet]);

  return (
    <BareApiContext.Provider value={backend}>
      {children}
    </BareApiContext.Provider>
  );
};

export const useBackend = () => {
  const context = useContext(BareApiContext);
  if (context === null) {
    console.warn("useBackend must be used within a BareProvider");
  }
  return context;
};

export default BareProvider;
