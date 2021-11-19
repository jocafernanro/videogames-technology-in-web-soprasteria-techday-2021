export default function attachEvents() {
  const popupLearning = document.querySelector("#popup-learning");
  const popupWork = document.querySelector("#popup-work");
  popupLearning.addEventListener("openPopupLearning", () => {
    popupLearning.style.visibility = "visible";
  });
  popupWork.addEventListener("openPopupWork", () => {
    popupWork.style.visibility = "visible";
  });

  const closePopupLearningButton = document.querySelector(
    "#close-popup-learning-button"
  );
  const closePopupWorkButton = document.querySelector(
    "#close-popup-work-button"
  );
  closePopupLearningButton.addEventListener("click", () => {
    popupLearning.style.visibility = "hidden";
  });
  closePopupWorkButton.addEventListener("click", () => {
    popupWork.style.visibility = "hidden";
  });
}
