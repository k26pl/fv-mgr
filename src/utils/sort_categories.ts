export type Category = { name: string; parentName?: string; indent?: number };

export default function (cats: Category[]) {
  let top_level = cats.filter((e) => !e.parentName);
  let children = cats.filter((e) => !!e.parentName);
  let out = [];
  for (let c of top_level) {
    c.indent = 0;
    out.push(c);
    let stack = [c.name];
    while (stack.length > 0) {
      let ind = children.findIndex(
        (d) => d.parentName === stack[stack.length - 1],
      );
      if (ind < 0) {
        stack.pop();
        if (stack.length == 0) break;
      } else {
        let [child] = children.splice(ind, 1);
        child.indent = stack.length;
        out.push(child);
        stack.push(child.name);
      }
    }
  }
  return out;
}
