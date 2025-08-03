import canvas from "./0.root.js";
import style from "./1.style.js";
import tag from "./2.tag.js";
import list from "./3.list.js";


const composeBlock = (headingType: (heading: string) => string, heading: string, contents: string[]) => {
  if (contents.length) { contents.push(canvas.unstyle); }
  return [headingType(heading), ...contents].join("\n");
};


type t_blockType = (
  heading: string,
  contents: string[]
) => string;

const blockType: Record<string, t_blockType> = {
  Chapter: (heading, contents) =>
    composeBlock(tag.H1, heading, contents),
  Section: (heading, contents) =>
    composeBlock(tag.H2, heading, contents),
  Footer: (heading, contents) =>
    composeBlock(tag.H3, heading, contents),
  Topic: (heading, contents) =>
    composeBlock(tag.H4, heading, contents),
  Note: (heading, contents) =>
    composeBlock(tag.H5, heading, contents),
  Points: (heading, contents) =>
    composeBlock(tag.H6, heading, contents),
};


type t_blockColor = (
  blockType: t_blockType,
  heading: string,
  contents: string[]
) => string;

const blockColor: Record<string, t_blockColor> = {
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


type t_SelectListTypeFn = (contents: string[], intent: number) => string[];

const createTextAndItem = (colorSettingKey: string) => {
  return {
    Text: (string: string, intent = 0): string => {
      const prefix = canvas.tab.repeat(intent);
      if (colorSettingKey === 'unstyle') { return prefix + canvas.unstyle + string; }
      return prefix + style.text[canvas.settings[colorSettingKey]](string);
    },
    Item: (string: string, intent = 0): string => {
      const styledString = colorSettingKey === 'unstyle'
        ? string
        : style.text[canvas.settings[colorSettingKey]](string);
      return canvas.tab.repeat(intent) + tag.Li(styledString);
    },
  };
};


const createBlockTypeMethods = (
  blockColorKey: keyof typeof blockColor,
  contentMapper: (content: string) => string,
  defaultListTypeGetter: (listModule: typeof list, key: keyof typeof list) => t_SelectListTypeFn
) => {
  const blockMethod = (
    blockTypeFn: t_blockType,
    heading: string,
    contents: string[] = [],
    selectListType: t_SelectListTypeFn = defaultListTypeGetter(list, blockColorKey as keyof typeof list),
    intent = 0
  ): string => {
    const mappedContents = contents.map(contentMapper);
    return (blockColor as any)[blockColorKey](
      blockTypeFn,
      heading,
      selectListType(mappedContents, intent)
    );
  };

  return {
    Chapter: (heading: string, contents?: string[] | Record<string, string>, selectListType?: t_SelectListTypeFn, intent = 0) =>
      blockMethod(blockType.Chapter, heading, contents, selectListType, intent),
    Section: (heading: string, contents?: string[] | Record<string, string>, selectListType?: t_SelectListTypeFn, intent = 0) =>
      blockMethod(blockType.Section, heading, contents, selectListType, intent),
    Footer: (heading: string, contents?: string[] | Record<string, string>, selectListType?: t_SelectListTypeFn, intent = 0) =>
      blockMethod(blockType.Footer, heading, contents, selectListType, intent),
    Topic: (heading: string, contents?: string[] | Record<string, string>, selectListType?: t_SelectListTypeFn, intent = 0) =>
      blockMethod(blockType.Topic, heading, contents, selectListType, intent),
    Note: (heading: string, contents?: string[] | Record<string, string>, selectListType?: t_SelectListTypeFn, intent = 0) =>
      blockMethod(blockType.Note, heading, contents, selectListType, intent),
    List: (heading: string, contents?: string[] | Record<string, string>, selectListType?: t_SelectListTypeFn, intent = 0) =>
      blockMethod(blockType.Points, heading, contents, selectListType, intent),
  };
};


const createColorGroupExport = (
  blockColorKey: keyof typeof blockColor
) => {
  const textAndItemFns = createTextAndItem(blockColorKey=== 'std' ? 'unstyle' : blockColorKey);

  const contentMapper: (content: string) => string = blockColorKey === 'std'
    ? (content) => content // No styling for content in 'std' blocks
    : (content) => style.text[canvas.settings[blockColorKey] as CanvasSettingColorKey](content);

  const blockTypeMethods = createBlockTypeMethods(
    blockColorKey,
    contentMapper,
    (listModule, key) => (listModule as any)[key].Blocks // Dynamic access to list.color.Blocks
  );

  return {
    Text: textAndItemFns.Text,
    Item: textAndItemFns.Item,
    Block: (contents: string[] = [], selectListType: t_SelectListTypeFn = (list as any)[blockColorKey].Blocks, intent = 0): string => {
      const joinedContent = selectListType(contents, intent).join("\n");
      if (blockColorKey === 'std') { return canvas.unstyle + joinedContent + "\n"; }
      return style.text[canvas.settings[blockColorKey]](joinedContent) + "\n";
    },
    ...blockTypeMethods,
  };
};


export default {
  std: createColorGroupExport('std'),
  title: createColorGroupExport('title'),
  text: createColorGroupExport('text'),
  primary: createColorGroupExport('primary'),
  secondary: createColorGroupExport('secondary'),
  tertiary: createColorGroupExport('tertiary'),
  failed: createColorGroupExport('failed'),
  success: createColorGroupExport('success'),
  warning: createColorGroupExport('warning'),
};