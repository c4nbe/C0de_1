let spanElement: HTMLSpanElement = document.querySelector("span#idhi")!;
spanElement.textContent = "world";

let newSpan: HTMLSpanElement = document.createElement("span");
newSpan.textContent = "swag";
document.body.appendChild(newSpan);
newSpan.style.backgroundColor = "blue";

console.log(newSpan);