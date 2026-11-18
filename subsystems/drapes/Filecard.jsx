import { createSignal, Show } from "solid-js";
import { Dynamic } from "solid-js/web";
import { Image } from "./Image.jsx";
import { Toggles } from "./Toggles.jsx";

export const SIZES = ["collapse", "small", "full", "cover"];

const GLYPHS = { collapse: "minimize", small: "thumb", full: "wide", cover: "expand" };

const Picture = (props) => {
  const [size, setSize] = createSignal("small");
  const [covering, setCovering] = createSignal(false);
  const pick = (option) => (option === "cover" ? setCovering(true) : setSize(option));
  const stepped = (steps) => pick(SIZES[SIZES.indexOf(size()) + steps]);
  const picked = (option, event) => {
    event.stopPropagation();
    pick(option);
  };
  return (
    <figure class="filecard" data-size={size()}>
      <figcaption onClick={() => stepped(size() === "collapse" ? 1 : -1)}>
        <span class="fn" title={props.name}>
          {props.name}
        </span>
        <Toggles
          label="picture size"
          options={SIZES}
          on={covering() ? [size(), "cover"] : [size()]}
          icons={GLYPHS}
          onPick={picked}
        />
      </figcaption>
      <Show when={size() !== "collapse"}>
        <Image src={props.src} alt={props.name} onClick={() => stepped(1)} />
      </Show>
      <Show when={covering()}>
        <button class="cover" aria-label="close" onClick={() => setCovering(false)}>
          <Image src={props.src} alt={props.name} />
        </button>
      </Show>
    </figure>
  );
};

const Sound = (props) => (
  <figure class="filecard">
    <figcaption>
      <span class="fn" title={props.name}>
        {props.name}
      </span>
    </figcaption>
    <audio src={props.src} controls preload="metadata" />
  </figure>
);

const Film = (props) => (
  <figure class="filecard">
    <figcaption>
      <span class="fn" title={props.name}>
        {props.name}
      </span>
    </figcaption>
    <video src={props.src} controls preload="metadata" />
  </figure>
);

const Plain = (props) => (
  <figure class="filecard">
    <figcaption>
      <a class="fn" href={props.src} title={props.name} target="_blank" rel="noopener">
        {props.name}
      </a>
    </figcaption>
  </figure>
);

export const FILECARDS = [
  [(mime) => mime.startsWith("image/"), Picture],
  [(mime) => mime.startsWith("audio/"), Sound],
  [(mime) => mime.startsWith("video/"), Film],
  [() => true, Plain],
];

const card = (mime) => FILECARDS.find(([carries]) => carries(mime))[1];

export const Filecard = (props) => <Dynamic component={card(props.mime)} name={props.name} src={props.src} />;
