type Level = "INFO" | "WARN" | "ERROR";

function log(level: Level, module: string, msg: string, data?: Record<string, unknown>) {
  const entry = { ts: new Date().toISOString(), level, module, msg, ...data };
  const line = JSON.stringify(entry);
  if (level === "ERROR") console.error(line);
  else if (level === "WARN") console.warn(line);
  else console.log(line);
}

export const logger = {
  info:  (module: string, msg: string, data?: Record<string, unknown>) => log("INFO",  module, msg, data),
  warn:  (module: string, msg: string, data?: Record<string, unknown>) => log("WARN",  module, msg, data),
  error: (module: string, msg: string, data?: Record<string, unknown>) => log("ERROR", module, msg, data),
};
