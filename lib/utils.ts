import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type SuccessResult<T> = {
  status: "success",
  data: T
};

export type FailedResult = {
  status: "failed",
  message: any
}

export type Result<T> = SuccessResult<T> | FailedResult;

export function unwrapResult<T>(result: Result<T>): T {
  if (result.status === "success") {
    return result.data;
  } else {
    throw new Error(result.message);
  }
}