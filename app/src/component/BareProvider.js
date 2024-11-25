import { createContext, useContext, useState, useEffect, useCallback } from "react";

import { getBackend } from "../lib/rpc";
import useWorklet from "../hook/useWorklet";

const BareApiContext = createContext(null);
const noop = () => {};

export const BareProvider = ({ children, rpcHandler = noop }) => {
  const [backend, setBackend] = useState(null);
  const [worklet, rpc] = useWorklet(rpcHandler);

  useEffect(() => {
    let mounted = true;

    if (!worklet) return;

    const startWorklet = async () => {
      try {
        await worklet.start("/app.bundle", require("../../worklet/app.bundle"));
      } catch (error) {
        console.error("Error starting worklet:", error);
      }
    };

    if (mounted) {
      startWorklet();
    }

    return () => {
      mounted = false;
      if (worklet) {
        worklet.stop();
      }
    };
  }, [worklet]);

  useEffect(() => {
    let mounted = true;

    if (!rpc || !worklet) return;

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
        // Clean up any backend resources
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
