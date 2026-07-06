export const aperture = new Vector().use().open("assitant/message", () => {
  // write buffer.data.history
  // write tools to hallucination
  // write context persona identity role to context
  // define the input and output schema
  // input { message, history:[{}] }
  // output { message: Text, hint?:Text, taunt?:Text isSolved?:Bool, resolve?:Bool }
  // run the hallucination
  // write buffer.data.history
  // LATER: try to communicate with client by updating/writing the buffer and have buffer.$data on the client side.
  // if resolved: run mode.call ? mode.connection.call?
  // maybe run an evaluation step per ??
  // return output
});
