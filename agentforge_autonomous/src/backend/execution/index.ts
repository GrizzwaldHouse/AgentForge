// Register all backends on import
import "./SimulatedBackend";
import "./OllamaBackend";
import "./ProviderChainBackend";

export {
  type ExecutionBackend,
  type BackendConfig,
  type BackendType,
  type TaskStatus,
  type ExecutionErrorCode,
  ExecutionError,
  createBackend,
  registerBackend,
} from "./ExecutionBackend";
export { SimulatedBackend } from "./SimulatedBackend";
export { OllamaBackend } from "./OllamaBackend";
export { ProviderChainBackend } from "./ProviderChainBackend";
