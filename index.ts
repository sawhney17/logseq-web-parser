import "@logseq/libs";
import { BlockCommandCallback } from "@logseq/libs/dist/LSPlugin.user";
import Mercury from "@postlight/mercury-parser";
import { NodeHtmlMarkdown, NodeHtmlMarkdownOptions } from "node-html-markdown";
import { splitBlock } from "./splitblock";

// /* ********************************************************* *
//  * Single use
//  * If using it once, you can use the static method
//  * ********************************************************* */
// console.log(NodeHtmlMarkdown.translate(
//   /* html */ result.content,
//   /* options (optional) */ {},
//   /* customTranslators (optional) */ undefined,
//   /* customCodeBlockTranslators (optional) */ undefined
// ));
// // Single file
const regexRules =
  /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;

const parseBlock = async (e) => {
  const block = await logseq.Editor.getBlock(e.uuid);
  block.content.match(regexRules).forEach((url) => {
    console.log(url);
    Mercury.parse(url, { contentType: "html" }).then((result) => {
      logseq.Editor.insertBatchBlock(
        e.uuid,
        splitBlock(NodeHtmlMarkdown.translate(result.content)),
        {sibling: false}
      );
    });
  });
}

const main = async () => {
  console.log("plugin loaded");
  logseq.Editor.registerBlockContextMenuItem("Parse URL", parseBlock), 
  logseq.Editor.registerSlashCommand("Parse URL", parseBlock);
};

logseq.ready(main).catch(console.error);
