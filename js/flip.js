(() => {
  const icon = document.querySelector(".profile-icon");
  if (!icon) return;

  const flip = () => {
    icon.classList.add("is-flipped");
    setTimeout(() => icon.classList.remove("is-flipped"), 900);
  };

  // 初回少し待ってから開始
  setTimeout(flip, 600);
  setInterval(flip, 3200);
})();
