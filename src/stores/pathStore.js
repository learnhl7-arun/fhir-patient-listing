import { writable } from "svelte/store";

export const currentPath = writable(window.location.pathname);

currentPath.subscribe((value) => {
  window.history.pushState({}, "", value);
});