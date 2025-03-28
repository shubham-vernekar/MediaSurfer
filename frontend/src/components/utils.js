import axios from "axios";

const getDurationText = (duration) => {
    if (duration){
      let hours = Math.floor(duration / 3600);
      let minutes = Math.floor((duration - (hours * 3600)) / 60);
      if (hours > 0) {
        return hours + " hrs " + minutes + " mins";
      } else {
        if (minutes<2){
          return minutes + " min";
        }else{
          return minutes + " mins";
        }
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

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim();
          // Does this cookie string begin with the name we want?
          if (cookie.substring(0, name.length + 1) === (name + '=')) {
              cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
              break;
          }
      }
  }
  return cookieValue;
}

const OpenLocalPlayer = (vidid) => {
  axios({
    method: "post",
    url: "/api/videos/" + vidid + "/open",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken')
    },
  });
};

const OpenFolder = (vidid) => {
  axios({
    method: "post",
    url: "/api/videos/" + vidid + "/folder",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken')
    },
  });
};


export { getDurationText, getCreatedDate, dateToTimestamp, clearSiblingSelection, clearChildren, 
  toggleDisplay, secondsToHHMMSS, getSize, getCookie, OpenLocalPlayer, OpenFolder}