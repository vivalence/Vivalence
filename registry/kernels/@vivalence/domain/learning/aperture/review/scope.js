export default async function ({ scope, signal }, ctx) {
  // const reviews = [];
  // if (scope.literal) {
  //   const input = { signal, scope };
  //   const review = ctx.daemon.call("/review/literal", input);
  //   reviews.push(review);
  // }
  // if (scope.symbol) {
  //   const input = { signal, scope };
  //   const review = ctx.daemon.call("/review/symbol", input);
  //   reviews.push(review);
  // }
  // scope.literal?.symbols?.map((symbol) => {
  //   const input = { signal, scope: { ...scope, symbol } };
  //   const review = ctx.daemon.call("/review/symbol", input);
  //   reviews.push(review);
  // });
  // scope.symbols?.map((symbol) => {
  //   const input = { signal, scope: { ...scope, symbols: null, symbol } };
  //   const review = ctx.daemon.call("/review/symbol", input);
  //   reviews.push(review);
  // });
  // scope.literals?.map((literal) => {
  //   const input = { signal, scope: { ...scope, literals: null, literal } };
  //   const review = ctx.daemon.call("/review/scope", input);
  //   reviews.push(review);
  // });
  // return await Promise.all(reviews);
}
