import List from "./List.svelte";

const LIST = (props) => {
  console.log("LIST fn, this props", this, props);
  // return <list:props>
};

LIST.type = "MENU";
LIST.key = "LIST";
LIST.component = List;
LIST.props = { active: { MODAL: "MODAL" } };

export const signals = { LIST };
