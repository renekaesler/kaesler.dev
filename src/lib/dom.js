export async function getBounds(...elements) {
  return new Promise(resolve => {
    const observer = new IntersectionObserver(entries => {
      const bounds = entries.map(e => ({
        target: e.target,
        bounds: e.boundingClientRect,
      }));

      observer.disconnect();
      resolve(bounds);
    });

    for (const element of elements) {
      observer.observe(element);
    }
  });
}