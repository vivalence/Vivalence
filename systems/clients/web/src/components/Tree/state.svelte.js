export default class TreeState {
  root = {};
  state = $state();
  isOpen = $state();
  isRoot = $state();

  constructor({ root, isOpen = true }) {
    this.isRoot = true;
    this.root = root;
    this.state = root;
    this.isOpen = isOpen;
  }

  setState(newState) {
    this.state = newState;
    this.isRoot = false;
  }

  toggle() {
    this.isOpen = !this.isOpen;
  }

  reset() {
    this.state = this.root;
    this.isRoot = true;
  }
}
