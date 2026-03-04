import { Mark, mergeAttributes } from "@tiptap/core";

export const ColorMark = Mark.create({
  name: "colorMark",

  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-color") || element.style.color || null,
        renderHTML: (attributes) => {
          if (!attributes.color) return {};
          return {
            "data-color": attributes.color,
            style: `color: ${attributes.color}`
          };
        }
      }
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-color]"
      },
      {
        tag: "span[style*=color]"
      }
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setColorMark:
        (color) =>
        ({ chain }) =>
          chain().setMark(this.name, { color }).run(),
      unsetColorMark:
        () =>
        ({ chain }) =>
          chain().unsetMark(this.name).run()
    };
  }
});
