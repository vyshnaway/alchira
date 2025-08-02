import canvas from "./0.root.js";
import style from "./1.style.js";
import tag from "./2.tag.js";
import list from "./3.list.js";

const composeBlock = (headingType, heading, contents) => {
  if (contents.length) contents.push(canvas.unstyle);
  return [headingType(heading), ...contents].join("\n");
};

export const blockType = {
  Chapter: (heading, contents, startWith) =>
    composeBlock(tag.H1, heading, contents, startWith),
  Section: (heading, contents, startWith) =>
    composeBlock(tag.H2, heading, contents, startWith),
  Footer: (heading, contents, startWith) =>
    composeBlock(tag.H3, heading, contents, startWith),
  Topic: (heading, contents, startWith) =>
    composeBlock(tag.H4, heading, contents, startWith),
  Note: (heading, contents, startWith) =>
    composeBlock(tag.H5, heading, contents, startWith),
  Points: (heading, contents, startWith) =>
    composeBlock(tag.H6, heading, contents, startWith),
};

export const blockColor = {
  std: (blockType, heading, contents) =>
    style.bold[canvas.settings.primary](
      blockType(
        heading,
        contents.map((content) => content),
      ),
    ),
  title: (blockType, heading, contents) =>
    style.bold[canvas.settings.title](
      blockType(
        heading,
        contents.map((content) => style.text[canvas.settings.title](content)),
      ),
    ),
  text: (blockType, heading, contents) =>
    style.bold[canvas.settings.text](
      blockType(
        heading,
        contents.map((content) => style.text[canvas.settings.text](content)),
      ),
    ),
  primary: (blockType, heading, contents) =>
    style.bold[canvas.settings.primary](
      blockType(
        heading,
        contents.map((content) => style.text[canvas.settings.primary](content)),
      ),
    ),
  secondary: (blockType, heading, contents) =>
    style.bold[canvas.settings.secondary](
      blockType(
        heading,
        contents.map((content) =>
          style.text[canvas.settings.secondary](content),
        ),
      ),
    ),
  tertiary: (blockType, heading, contents) =>
    style.bold[canvas.settings.tertiary](
      blockType(
        heading,
        contents.map((content) =>
          style.text[canvas.settings.tertiary](content),
        ),
      ),
    ),
  success: (blockType, heading, contents) =>
    style.bold[canvas.settings.success](
      blockType(
        heading,
        contents.map((content) => style.text[canvas.settings.success](content)),
      ),
    ),
  failed: (blockType, heading, contents) =>
    style.bold[canvas.settings.failed](
      blockType(
        heading,
        contents.map((content) => style.text[canvas.settings.failed](content)),
      ),
    ),
  warning: (blockType, heading, contents) =>
    style.bold[canvas.settings.warning](
      blockType(
        heading,
        contents.map((content) => style.text[canvas.settings.warning](content)),
      ),
    ),
};

export default {
  std: {
    Text: (string, intent = 0) =>
      canvas.tab.repeat(intent) + canvas.unstyle + string,
    Item: (string, intent = 0) => canvas.tab.repeat(intent) + tag.Li(string),
    Chapter: (
      heading,
      contents = [],
      selectListType = list.std.Blocks,
      intent = 0,
    ) =>
      blockColor.std(
        blockType.Chapter,
        heading,
        selectListType(contents, intent),
      ),
    Section: (
      heading,
      contents = [],
      selectListType = list.std.Blocks,
      intent = 0,
    ) =>
      blockColor.std(
        blockType.Section,
        heading,
        selectListType(contents, intent),
      ),
    Footer: (
      heading,
      contents = [],
      selectListType = list.std.Blocks,
      intent = 0,
    ) =>
      blockColor.std(
        blockType.Footer,
        heading,
        selectListType(contents, intent),
      ),
    Topic: (
      heading,
      contents = [],
      selectListType = list.std.Blocks,
      intent = 0,
    ) =>
      blockColor.std(
        blockType.Topic,
        heading,
        selectListType(contents, intent),
      ),
    Note: (
      heading,
      contents = [],
      selectListType = list.std.Blocks,
      intent = 0,
    ) =>
      blockColor.std(blockType.Note, heading, selectListType(contents, intent)),
    List: (
      heading,
      contents = [],
      selectListType = list.std.Blocks,
      intent = 0,
    ) =>
      blockColor.std(
        blockType.Points,
        heading,
        selectListType(contents, intent),
      ),
    Block: (contents = [], selectListType = list.std.Blocks, intent = 0) =>
      canvas.unstyle + selectListType(contents, intent).join("\n") + "\n",
  },
  title: {
    Text: (string, intent = 0) =>
      canvas.tab.repeat(intent) + style.text[canvas.settings.title](string),
    Item: (string, intent = 0) =>
      canvas.tab.repeat(intent) +
      tag.Li(style.text[canvas.settings.title](string)),
    Chapter: (
      heading,
      contents = [],
      selectListType = list.title.Blocks,
      intent = 0,
    ) =>
      blockColor.title(
        blockType.Chapter,
        heading,
        selectListType(contents, intent),
      ),
    Section: (
      heading,
      contents = [],
      selectListType = list.title.Blocks,
      intent = 0,
    ) =>
      blockColor.title(
        blockType.Section,
        heading,
        selectListType(contents, intent),
      ),
    Footer: (
      heading,
      contents = [],
      selectListType = list.title.Blocks,
      intent = 0,
    ) =>
      blockColor.title(
        blockType.Footer,
        heading,
        selectListType(contents, intent),
      ),
    Topic: (
      heading,
      contents = [],
      selectListType = list.title.Blocks,
      intent = 0,
    ) =>
      blockColor.title(
        blockType.Topic,
        heading,
        selectListType(contents, intent),
      ),
    Note: (
      heading,
      contents = [],
      selectListType = list.title.Blocks,
      intent = 0,
    ) =>
      blockColor.title(
        blockType.Note,
        heading,
        selectListType(contents, intent),
      ),
    List: (
      heading,
      contents = [],
      selectListType = list.title.Blocks,
      intent = 0,
    ) =>
      blockColor.title(
        blockType.Points,
        heading,
        selectListType(contents, intent),
      ),
    Block: (contents = [], selectListType = list.title.Blocks, intent = 0) =>
      style.text[canvas.settings.title](
        selectListType(contents, intent).join("\n"),
      ) + "\n",
  },
  text: {
    Text: (string, intent = 0) =>
      canvas.tab.repeat(intent) + style.text[canvas.settings.text](string),
    Item: (string, intent = 0) =>
      canvas.tab.repeat(intent) +
      tag.Li(style.text[canvas.settings.text](string)),
    Chapter: (
      heading,
      contents = [],
      selectListType = list.text.Blocks,
      intent = 0,
    ) =>
      blockColor.text(
        blockType.Chapter,
        heading,
        selectListType(contents, intent),
      ),
    Section: (
      heading,
      contents = [],
      selectListType = list.text.Blocks,
      intent = 0,
    ) =>
      blockColor.text(
        blockType.Section,
        heading,
        selectListType(contents, intent),
      ),
    Footer: (
      heading,
      contents = [],
      selectListType = list.text.Blocks,
      intent = 0,
    ) =>
      blockColor.text(
        blockType.Footer,
        heading,
        selectListType(contents, intent),
      ),
    Topic: (
      heading,
      contents = [],
      selectListType = list.text.Blocks,
      intent = 0,
    ) =>
      blockColor.text(
        blockType.Topic,
        heading,
        selectListType(contents, intent),
      ),
    Note: (
      heading,
      contents = [],
      selectListType = list.text.Blocks,
      intent = 0,
    ) =>
      blockColor.text(
        blockType.Note,
        heading,
        selectListType(contents, intent),
      ),
    List: (
      heading,
      contents = [],
      selectListType = list.text.Blocks,
      intent = 0,
    ) =>
      blockColor.text(
        blockType.Points,
        heading,
        selectListType(contents, intent),
      ),
    Block: (contents = [], selectListType = list.text.Blocks, intent = 0) =>
      style.text[canvas.settings.text](
        selectListType(contents, intent).join("\n"),
      ) + "\n",
  },
  primary: {
    Text: (string, intent = 0) =>
      canvas.tab.repeat(intent) + style.text[canvas.settings.primary](string),
    Item: (string, intent = 0) =>
      canvas.tab.repeat(intent) +
      tag.Li(style.text[canvas.settings.primary](string)),
    Chapter: (
      heading,
      contents = [],
      selectListType = list.primary.Blocks,
      intent = 0,
    ) =>
      blockColor.primary(
        blockType.Chapter,
        heading,
        selectListType(contents, intent),
      ),
    Section: (
      heading,
      contents = [],
      selectListType = list.primary.Blocks,
      intent = 0,
    ) =>
      blockColor.primary(
        blockType.Section,
        heading,
        selectListType(contents, intent),
      ),
    Footer: (
      heading,
      contents = [],
      selectListType = list.primary.Blocks,
      intent = 0,
    ) =>
      blockColor.primary(
        blockType.Footer,
        heading,
        selectListType(contents, intent),
      ),
    Topic: (
      heading,
      contents = [],
      selectListType = list.primary.Blocks,
      intent = 0,
    ) =>
      blockColor.primary(
        blockType.Topic,
        heading,
        selectListType(contents, intent),
      ),
    Note: (
      heading,
      contents = [],
      selectListType = list.primary.Blocks,
      intent = 0,
    ) =>
      blockColor.primary(
        blockType.Note,
        heading,
        selectListType(contents, intent),
      ),
    List: (
      heading,
      contents = [],
      selectListType = list.primary.Blocks,
      intent = 0,
    ) =>
      blockColor.primary(
        blockType.Points,
        heading,
        selectListType(contents, intent),
      ),
    Block: (contents = [], selectListType = list.primary.Blocks, intent = 0) =>
      style.text[canvas.settings.primary](
        selectListType(contents, intent).join("\n"),
      ) + "\n",
  },
  secondary: {
    Text: (string, intent = 0) =>
      canvas.tab.repeat(intent) + style.text[canvas.settings.secondary](string),
    Item: (string, intent = 0) =>
      canvas.tab.repeat(intent) +
      tag.Li(style.text[canvas.settings.secondary](string)),
    Chapter: (
      heading,
      contents = [],
      selectListType = list.secondary.Blocks,
      intent = 0,
    ) =>
      blockColor.secondary(
        blockType.Chapter,
        heading,
        selectListType(contents, intent),
      ),
    Section: (
      heading,
      contents = [],
      selectListType = list.secondary.Blocks,
      intent = 0,
    ) =>
      blockColor.secondary(
        blockType.Section,
        heading,
        selectListType(contents, intent),
      ),
    Footer: (
      heading,
      contents = [],
      selectListType = list.secondary.Blocks,
      intent = 0,
    ) =>
      blockColor.secondary(
        blockType.Footer,
        heading,
        selectListType(contents, intent),
      ),
    Topic: (
      heading,
      contents = [],
      selectListType = list.secondary.Blocks,
      intent = 0,
    ) =>
      blockColor.secondary(
        blockType.Topic,
        heading,
        selectListType(contents, intent),
      ),
    Note: (
      heading,
      contents = [],
      selectListType = list.secondary.Blocks,
      intent = 0,
    ) =>
      blockColor.secondary(
        blockType.Note,
        heading,
        selectListType(contents, intent),
      ),
    List: (
      heading,
      contents = [],
      selectListType = list.secondary.Blocks,
      intent = 0,
    ) =>
      blockColor.secondary(
        blockType.Points,
        heading,
        selectListType(contents, intent),
      ),
    Block: (
      contents = [],
      selectListType = list.secondary.Blocks,
      intent = 0,
    ) =>
      style.text[canvas.settings.secondary](
        selectListType(contents, intent).join("\n"),
      ) + "\n",
  },
  tertiary: {
    Text: (string, intent = 0) =>
      canvas.tab.repeat(intent) + style.text[canvas.settings.tertiary](string),
    Item: (string, intent = 0) =>
      canvas.tab.repeat(intent) +
      tag.Li(style.text[canvas.settings.tertiary](string)),
    Chapter: (
      heading,
      contents = [],
      selectListType = list.tertiary.Blocks,
      intent = 0,
    ) =>
      blockColor.tertiary(
        blockType.Chapter,
        heading,
        selectListType(contents, intent),
      ),
    Section: (
      heading,
      contents = [],
      selectListType = list.tertiary.Blocks,
      intent = 0,
    ) =>
      blockColor.tertiary(
        blockType.Section,
        heading,
        selectListType(contents, intent),
      ),
    Footer: (
      heading,
      contents = [],
      selectListType = list.tertiary.Blocks,
      intent = 0,
    ) =>
      blockColor.tertiary(
        blockType.Footer,
        heading,
        selectListType(contents, intent),
      ),
    Topic: (
      heading,
      contents = [],
      selectListType = list.tertiary.Blocks,
      intent = 0,
    ) =>
      blockColor.tertiary(
        blockType.Topic,
        heading,
        selectListType(contents, intent),
      ),
    Note: (
      heading,
      contents = [],
      selectListType = list.tertiary.Blocks,
      intent = 0,
    ) =>
      blockColor.tertiary(
        blockType.Note,
        heading,
        selectListType(contents, intent),
      ),
    List: (
      heading,
      contents = [],
      selectListType = list.tertiary.Blocks,
      intent = 0,
    ) =>
      blockColor.tertiary(
        blockType.Points,
        heading,
        selectListType(contents, intent),
      ),
    Block: (contents = [], selectListType = list.tertiary.Blocks, intent = 0) =>
      style.text[canvas.settings.tertiary](
        selectListType(contents, intent).join("\n"),
      ) + "\n",
  },
  failed: {
    Text: (string, intent = 0) =>
      canvas.tab.repeat(intent) + style.text[canvas.settings.failed](string),
    Item: (string, intent = 0) =>
      canvas.tab.repeat(intent) +
      tag.Li(style.text[canvas.settings.failed](string)),
    Chapter: (
      heading,
      contents = [],
      selectListType = list.failed.Blocks,
      intent = 0,
    ) =>
      blockColor.failed(
        blockType.Chapter,
        heading,
        selectListType(contents, intent),
      ),
    Section: (
      heading,
      contents = [],
      selectListType = list.failed.Blocks,
      intent = 0,
    ) =>
      blockColor.failed(
        blockType.Section,
        heading,
        selectListType(contents, intent),
      ),
    Footer: (
      heading,
      contents = [],
      selectListType = list.failed.Blocks,
      intent = 0,
    ) =>
      blockColor.failed(
        blockType.Footer,
        heading,
        selectListType(contents, intent),
      ),
    Topic: (
      heading,
      contents = [],
      selectListType = list.failed.Blocks,
      intent = 0,
    ) =>
      blockColor.failed(
        blockType.Topic,
        heading,
        selectListType(contents, intent),
      ),
    Note: (
      heading,
      contents = [],
      selectListType = list.failed.Blocks,
      intent = 0,
    ) =>
      blockColor.failed(
        blockType.Note,
        heading,
        selectListType(contents, intent),
      ),
    List: (
      heading,
      contents = [],
      selectListType = list.failed.Blocks,
      intent = 0,
    ) =>
      blockColor.failed(
        blockType.Points,
        heading,
        selectListType(contents, intent),
      ),
    Block: (contents = [], selectListType = list.failed.Blocks, intent = 0) =>
      style.text[canvas.settings.failed](
        selectListType(contents, intent).join("\n"),
      ) + "\n",
  },
  success: {
    Text: (string, intent = 0) =>
      canvas.tab.repeat(intent) + style.text[canvas.settings.success](string),
    Item: (string, intent = 0) =>
      canvas.tab.repeat(intent) +
      tag.Li(style.text[canvas.settings.success](string)),
    Chapter: (
      heading,
      contents = [],
      selectListType = list.success.Blocks,
      intent = 0,
    ) =>
      blockColor.success(
        blockType.Chapter,
        heading,
        selectListType(contents, intent),
      ),
    Section: (
      heading,
      contents = [],
      selectListType = list.success.Blocks,
      intent = 0,
    ) =>
      blockColor.success(
        blockType.Section,
        heading,
        selectListType(contents, intent),
      ),
    Footer: (
      heading,
      contents = [],
      selectListType = list.success.Blocks,
      intent = 0,
    ) =>
      blockColor.success(
        blockType.Footer,
        heading,
        selectListType(contents, intent),
      ),
    Topic: (
      heading,
      contents = [],
      selectListType = list.success.Blocks,
      intent = 0,
    ) =>
      blockColor.success(
        blockType.Topic,
        heading,
        selectListType(contents, intent),
      ),
    Note: (
      heading,
      contents = [],
      selectListType = list.success.Blocks,
      intent = 0,
    ) =>
      blockColor.success(
        blockType.Note,
        heading,
        selectListType(contents, intent),
      ),
    List: (
      heading,
      contents = [],
      selectListType = list.success.Blocks,
      intent = 0,
    ) =>
      blockColor.success(
        blockType.Points,
        heading,
        selectListType(contents, intent),
      ),
    Block: (contents = [], selectListType = list.success.Blocks, intent = 0) =>
      style.text[canvas.settings.success](
        selectListType(contents, intent).join("\n"),
      ) + "\n",
  },
  warning: {
    Text: (string, intent = 0) =>
      canvas.tab.repeat(intent) + style.text[canvas.settings.warning](string),
    Item: (string, intent = 0) =>
      canvas.tab.repeat(intent) +
      tag.Li(style.text[canvas.settings.warning](string)),
    Chapter: (
      heading,
      contents = [],
      selectListType = list.warning.Blocks,
      intent = 0,
    ) =>
      blockColor.warning(
        blockType.Chapter,
        heading,
        selectListType(contents, intent),
      ),
    Section: (
      heading,
      contents = [],
      selectListType = list.warning.Blocks,
      intent = 0,
    ) =>
      blockColor.warning(
        blockType.Section,
        heading,
        selectListType(contents, intent),
      ),
    Footer: (
      heading,
      contents = [],
      selectListType = list.warning.Blocks,
      intent = 0,
    ) =>
      blockColor.warning(
        blockType.Footer,
        heading,
        selectListType(contents, intent),
      ),
    Topic: (
      heading,
      contents = [],
      selectListType = list.warning.Blocks,
      intent = 0,
    ) =>
      blockColor.warning(
        blockType.Topic,
        heading,
        selectListType(contents, intent),
      ),
    Note: (
      heading,
      contents = [],
      selectListType = list.warning.Blocks,
      intent = 0,
    ) =>
      blockColor.warning(
        blockType.Note,
        heading,
        selectListType(contents, intent),
      ),
    List: (
      heading,
      contents = [],
      selectListType = list.warning.Blocks,
      intent = 0,
    ) =>
      blockColor.warning(
        blockType.Points,
        heading,
        selectListType(contents, intent),
      ),
    Block: (contents = [], selectListType = list.warning.Blocks, intent = 0) =>
      style.text[canvas.settings.warning](
        selectListType(contents, intent).join("\n"),
      ) + "\n",
  },
};
