export function collect(fn, ms = 0) {
  let handle;
  let collected = [];

  const exec = () => {
    fn(collected);
    handle = null;
    collected = [];
  }

  return (...args) => {
    collected.push(args);

    if(!handle) {
      handle = setTimeout(exec, ms);
    }
  };
}