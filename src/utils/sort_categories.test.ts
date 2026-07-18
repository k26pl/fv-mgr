import test from "node:test";
import sort_categories from "./sort_categories.ts";
import type { Category } from "./sort_categories.ts";

test("categories get sorted", (t) => {
  let cats: Category[] = [
    { name: "a" },
    { name: "h", parentName: "a" },
    { name: "j", parentName: "a" },
    { name: "i", parentName: "b" },
    { name: "f", parentName: "e" },
    { name: "e", parentName: "d" },
    { name: "g", parentName: "f" },
    { name: "d", parentName: "c" },
    { name: "c", parentName: "b" },
    { name: "b", parentName: "a" },
  ];
  t.assert.deepEqual(sort_categories(cats), [
    { name: "a", indent: 0 },
    { name: "h", parentName: "a", indent: 1 },
    { name: "j", parentName: "a", indent: 1 },
    { name: "b", parentName: "a", indent: 1 },
    { name: "i", parentName: "b", indent: 2 },
    { name: "c", parentName: "b", indent: 2 },
    { name: "d", parentName: "c", indent: 3 },
    { name: "e", parentName: "d", indent: 4 },
    { name: "f", parentName: "e", indent: 5 },
    { name: "g", parentName: "f", indent: 6 },
  ]);
});
