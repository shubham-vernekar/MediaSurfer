const getDurationText = (duration) => {
    if (duration){
      duration = duration.split(":");
      if (parseInt(duration[0]) > 0) {
        return parseInt(duration[0]) + " hrs " + parseInt(duration[1]) + " mins";
      } else {
        return parseInt(duration[1]) + " mins";
      }
    }
  };

const secondsToHHMMSS = (duration, full=false) => {
  duration = new Date(duration * 1000).toISOString().slice(11, 19).split(":");
  if (parseInt(duration[0]) > 0 || full) {
    return duration.join(":")
  } else {
    return duration.slice(1).join(":")
  }
};

const getCreatedDate = (targetDate) => {
  const created = new Date(targetDate);
  return created.toLocaleString("default", { month: "long" }) + " " + created.toLocaleString("default", { day: "2-digit" }).toUpperCase() + " " + created.getFullYear()
};

const dateToTimestamp = (targetDate) => {
  if (targetDate){
    return targetDate.split('.')[0]
  }
  return "NA"
};

const clearSiblingSelection = (target) => {
  let clickedSort = target.currentTarget;
  let clickedSiblings = clickedSort.parentElement.children;
  let sameButton = [...clickedSort.classList].includes("selected-filter");
  [...clickedSiblings].forEach((sib) =>
    sib.classList.remove("selected-filter")
  );
  let textData = "";
  if (!sameButton) {
    clickedSort.classList.add("selected-filter");
    textData = clickedSort.innerText.toLowerCase().trim();
  }
  return textData;
};

const clearChildren = (target) => {
  [...target.children].forEach((sib) =>
    sib.classList.remove("selected-filter")
  );
};

const toggleDisplay = (target) => {
  if (target){
    if (target.style.display === "") {
      target.style.display = "flex";
    } else {
      target.style.display = "";
    }
  }
};

const getSize = (size) => {
  if (size<1024){
    return parseFloat(size).toFixed(2) + " Mb"
  }else{
    return parseFloat(parseFloat(size)/parseFloat(1024)).toFixed(2) + " Gb"
  }
}

export { getDurationText, getCreatedDate, dateToTimestamp, clearSiblingSelection, clearChildren, toggleDisplay, secondsToHHMMSS, getSize}