import React from "react";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export function MethodBadge({
  method,
  className,
}: {
  method: HttpMethod;
  className?: string;
}) {
  return (
    <span className={`method method-${method.toLowerCase()}${className ? ` ${className}` : ""}`}>
      {method}
    </span>
  );
}
