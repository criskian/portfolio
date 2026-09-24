import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** `false` during SSR and hydration, `true` afterwards — without a re-render effect. */
export function useMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
