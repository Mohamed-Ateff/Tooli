function convertCase(caseType) {
  const textInput = document.getElementById("textInput");
  let text = textInput.value;

  switch (caseType) {
    case "uppercase":
      textInput.value = text.toUpperCase();
      break;
    case "lowercase":
      textInput.value = text.toLowerCase();
      break;
    case "titlecase":
      textInput.value = text
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      break;
    case "sentencecase":
      textInput.value = text
        .toLowerCase()
        .replace(/(^\s*\w|[.!?]\s*\w)/g, (char) => char.toUpperCase());
      break;
  }
}

function clearText() {
  document.getElementById("textInput").value = "";
}

function copyText() {
  const textInput = document.getElementById("textInput");
  textInput.select();
  document.execCommand("copy");
  alert("Text copied to clipboard!");
}
