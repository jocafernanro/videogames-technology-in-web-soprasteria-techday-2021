export default function attachEvents() {
  const popup = document.querySelector(".popup");
  popup.addEventListener("openPopup", () => {
    popup.style.visibility = "visible";
  });

  const closePopupButton = document.querySelector("#close-popup-button");
  closePopupButton.addEventListener("click", () => {
    popup.style.visibility = "hidden";
  });
}
