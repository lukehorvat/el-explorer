import { useReducer } from 'react';

/**
 * Hook that returns a `forceUpdate` function that can be called to force a re-render.
 *
 * @see https://legacy.reactjs.org/docs/hooks-faq.html#is-there-something-like-forceupdate
 */
export function useForceUpdate(): React.DispatchWithoutAction {
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);
  return forceUpdate;
}
