

export const getRandomColour = () => {
    let red = Math.floor(Math.random() * 255);
    let green = Math.floor(Math.random() * 255);
    let blue = Math.floor(Math.random() * 255);

    return "rgb(" + red + "," + green + "," + blue + " )";
};


export const isContainsObject = (obj, list) => {
    for (let i = 0; i < list.length; i++) {
        if (list[i] === obj) {
            return true;
        }
    }

  return false;
};