import { useQuery } from "@tanstack/react-query";
import { getRecent, getStarred, getTrash } from "../apis/library.ts";

export function useTrash() {
  return useQuery({ queryKey: ["trash"], queryFn: getTrash });
}

export function useStarred() {
  return useQuery({ queryKey: ["starred"], queryFn: getStarred });
}

export function useRecent() {
  return useQuery({ queryKey: ["recent"], queryFn: getRecent });
}
