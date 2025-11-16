import { createFileRoute } from "@tanstack/react-router";
import logo from "../logo.svg";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  return <div>2121</div>;
}

<div class="w-12 text-orange-600">
  <svg
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="3"></circle>
    <g>
      <circle cx="4" cy="12" r="3"></circle>
      <circle cx="20" cy="12" r="3"></circle>
      <animateTransform
        attributeName="transform"
        type="rotate"
        calcMode="spline"
        dur="1s"
        keySplines=".36,.6,.31,1;.36,.6,.31,1"
        values="0 12 12;180 12 12;360 12 12"
        repeatCount="indefinite"
      ></animateTransform>
    </g>
  </svg>
</div>;
