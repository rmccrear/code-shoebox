import { EnvironmentMode } from "./types";

export interface DocItem {
  name: string;
  desc: string;
  example?: string;
}

export interface DocSection {
  title: string;
  items: DocItem[];
}

export const P5_DOCS: DocSection[] = [
  {
    title: "Structure",
    items: [
      { name: "setup()", desc: "Called once when the program starts. Use it to define initial environment properties." },
      { name: "draw()", desc: "Called directly after setup(), the draw() function continuously executes the lines of code contained inside its block." },
    ]
  },
  {
    title: "Canvas & Color",
    items: [
      { name: "createCanvas(w, h)", desc: "Creates the canvas element in the document.", example: "createCanvas(400, 400);" },
      { name: "background(color)", desc: "Sets the color used for the background of the canvas.", example: "background(220);" },
      { name: "fill(color)", desc: "Sets the color used to fill shapes.", example: "fill(255, 0, 0);" },
      { name: "noFill()", desc: "Disables filling geometry." },
      { name: "stroke(color)", desc: "Sets the color used to draw lines and borders around shapes." },
      { name: "noStroke()", desc: "Disables drawing the stroke (outline)." },
    ]
  },
  {
    title: "Shapes",
    items: [
      { name: "rect(x, y, w, h)", desc: "Draws a rectangle to the screen.", example: "rect(30, 20, 55, 55);" },
      { name: "ellipse(x, y, w, h)", desc: "Draws an ellipse (oval) to the screen.", example: "ellipse(56, 46, 55, 55);" },
      { name: "circle(x, y, d)", desc: "Draws a circle to the screen." },
      { name: "line(x1, y1, x2, y2)", desc: "Draws a line (a direct path between two points) to the screen." },
      { name: "point(x, y)", desc: "Draws a point, a single coordinate in space." },
      { name: "triangle(x1, y1, x2, y2, x3, y3)", desc: "A triangle is a plane created by connecting three points." },
    ]
  },
  {
    title: "Input",
    items: [
      { name: "mouseX", desc: "System variable containing the current horizontal position of the mouse." },
      { name: "mouseY", desc: "System variable containing the current vertical position of the mouse." },
      { name: "mouseIsPressed", desc: "Boolean variable that is true if the mouse is being pressed." },
      { name: "keyIsPressed", desc: "Boolean variable that is true if any key is pressed." },
    ]
  }
];

export const getDocsForMode = (mode: EnvironmentMode): DocSection[] | null => {
  if (mode === 'p5') return P5_DOCS;
  return null;
};