export async function getBounds(elements, options) {
  return new Promise(resolve => {
    const observer = new IntersectionObserver(entries => {
      observer.disconnect();
      resolve(entries);
    }, options);

    for (const element of elements) {
      observer.observe(element);
    }
  });
}