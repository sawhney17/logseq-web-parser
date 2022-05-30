//Credits to https://github.com/hyrijk/logseq-plugin-split-block/blob/master/splitBlock.ts
import { IBatchBlock } from "@logseq/libs/dist/LSPlugin.user";

const isEmptyLine = (str: string) => /^\s*$/.test(str);
export function splitBlock(blockContent: string) {
  const lines = blockContent.split("\n").filter((line) => !isEmptyLine(line));
  if (lines.length === 1) {
    return [];
  }

  const batchBlock: IBatchBlock[] = [];
  const stack: {
    indent: number;
    block: IBatchBlock;
    parent?: IBatchBlock;
  }[] = [];
  lines.forEach((l) => {
    const content = l.trimStart();
    const indent = l.length - content.length;

    const nextBlock: IBatchBlock = {
      content,
      children: [],
    };

    if (!stack.length) {
      batchBlock.push(nextBlock);
      stack.push({
        indent,
        block: nextBlock,
      });
      return;
    }

    let top = stack[stack.length - 1];
    const indentDiff = indent - top.indent;

    if (indentDiff === 0) {
      // 同级，加入父节点的 children
      if (top.parent) {
        top.parent.children!.push(nextBlock);
      } else {
        batchBlock.push(nextBlock);
      }
      top.block = nextBlock;
    } else if (indentDiff > 0) {
      // 缩进
      top.block.children!.push(nextBlock);
      stack.push({
        indent,
        block: nextBlock,
        parent: top.block,
      });
    } else if (indentDiff < 0) {
      // 反缩进
      // 找到同一级别的 block 的 parent block
      while (top.indent > indent) {
        stack.pop();
        if (stack.length === 0) {
          return;
        }
        top = stack[stack.length - 1];
      }

      if (top.indent === indent) {

        if (top.parent) {
          top.parent.children!.push(nextBlock);
        } else {
          batchBlock.push(nextBlock);
        }
        top.block = nextBlock;
      } else {
        // 缩进没对齐的情况
        top.block.children.push(nextBlock);
        stack.push({
          indent,
          block: nextBlock,
          parent: top.block,
        });
      }
    }
  });


//if the content of any block is empty and has no children, filter it out
  return batchBlock.filter((block) => {
    if (block.content.length < 3 ) {
        return false;
    }
    return true;
});
}