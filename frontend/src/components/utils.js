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

export { getDurationText, getCreatedDate, dateToTimestamp }