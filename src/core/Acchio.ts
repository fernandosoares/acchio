import { AcchioInstance, AcchioRequestConfig, AcchioStatic } from "./types";
import { AcchioInstanceImpl } from "./AcchioInstance";
import { Cancel, isCancel } from "./Cancel";
import { CancelToken } from "./CancelToken";

function createInstance(config: AcchioRequestConfig = {}): AcchioInstance {
  return new AcchioInstanceImpl(config);
}

const acchio = createInstance() as AcchioStatic;

// Add method to create new instances
acchio.create = function create(config: AcchioRequestConfig): AcchioInstance {
  return createInstance(config);
};

// Add static properties for cancellation
acchio.Cancel = Cancel;
acchio.CancelToken = CancelToken;
acchio.isCancel = isCancel;

export default acchio;
