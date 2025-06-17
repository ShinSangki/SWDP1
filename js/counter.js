
const counters = document.querySelectorAll('[data-target]');

counters.forEach((counter) => {
  counter.textContent = "+0";
  const targetNum = +counter.getAttribute("data-target");

  const updateCounter = () => {
    const count = +counter.textContent.replace("+", "");
    const increment = targetNum / 100;
    const nextCount = Math.ceil(count + increment);
    const displayValue = nextCount > targetNum ? targetNum : nextCount;

    counter.textContent = "+" + displayValue;

    if (count < targetNum) {
      requestAnimationFrame(updateCounter);
    }
  };

  updateCounter();
});