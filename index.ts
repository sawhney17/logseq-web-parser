import "@logseq/libs";
import {
  BlockCommandCallback,
  SettingSchemaDesc,
} from "@logseq/libs/dist/LSPlugin.user";
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

const parseBlock = async (e, isSplit) => {
  const block = await logseq.Editor.getBlock(e.uuid);
  block?.content?.match(regexRules)?.forEach((url) => {
    console.log(url);
    Mercury.parse(url, { contentType: "html" }).then((result) => {
      if (isSplit) {
        logseq.Editor.insertBatchBlock(
          e.uuid,
          splitBlock(NodeHtmlMarkdown.translate(result.content)),
          { sibling: false }
        );
      } else {
        logseq.Editor.insertBlock(
          e.uuid,
          NodeHtmlMarkdown.translate(result.content),
          { sibling: false }
        );
      }
    });
  });
};

const main = async () => {
  console.log("plugin loaded");
  // top.addEventListener('message',(ev)=>{console.log("ev")})
  top?.addEventListener("message", (ev) => {
    console.log("console.log event added");
  });

  logseq.Editor.registerBlockContextMenuItem("Parse URL", async (e) => {
    parseBlock(e, true);
  }),
    logseq.Editor.registerBlockContextMenuItem(
      "Parse URL into single block",
      async (e) => {
        parseBlock(e, false);
      }
    ),
    logseq.Editor.registerSlashCommand(
      "Parse URL into Single Block",
      async (e) => {
        parseBlock(e, false);
      }
    );
  logseq.Editor.registerSlashCommand("Parse URL", async (e) => {
    parseBlock(e, true);
  });
};

logseq.ready(main).catch(console.error);
