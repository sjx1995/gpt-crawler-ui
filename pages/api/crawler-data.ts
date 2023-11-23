/*
 * @Description: 爬取网页内容
 * @Author: Sunly
 * @Date: 2023-11-22 14:17:33
 */
import { Configuration, PlaywrightCrawler } from "crawlee";
import type { Page } from "playwright";

import type { NextApiRequest, NextApiResponse } from "next";

export type ICrawlerParams = {
  target_url: string;
  match_urls: string[];
  max_pages: number;
  selector: string;
};

export type ICrawlerRes = {
  title: string;
  url: string;
  html: string;
};

export type ICrawlerData =
  | {
      success: true;
      data: ICrawlerRes[];
    }
  | {
      success: false;
      errMessage: string;
    };

function getHTML(page: Page, selector: string) {
  return page.evaluate((selector) => {
    const el: HTMLElement | null = document.querySelector(selector);
    return el?.innerText || "";
  }, selector);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ICrawlerData>
) {
  const query = req.query as { [K in keyof ICrawlerParams]: string };
  let target_url = query.target_url.trim();
  if (!target_url) {
    res
      .status(400)
      .json({ success: false, errMessage: "target_url is required" });
  }
  let selector = query.selector.trim() || "body";
  let max_pages = Number(query.max_pages) > 50 ? 50 : Number(query.max_pages);
  let match_urls = query.match_urls
    .split(",")
    .filter((content) => content.trim() !== "");

  const crawlerData: ICrawlerRes[] = [];

  // 创建爬虫
  const crawler = new PlaywrightCrawler({
    async requestHandler({ request, page, enqueueLinks, log }) {
      console.log("requestHandler", JSON.stringify(request, null, 2));
      const title = await page.title();
      log.info(`Page title: ${title}`);

      const html = await getHTML(page, selector);

      crawlerData.push({ title, url: request.loadedUrl || "", html });

      await enqueueLinks({ globs: match_urls });
    },

    maxRequestsPerCrawl: max_pages,
    maxConcurrency: 1,
  });

  // 开始爬取
  try {
    await crawler.run([target_url]);
  } catch (error) {
    res.status(500).json({
      success: false,
      errMessage: (error as Error).message || "请求失败",
    });
  }

  // 重置全局状态
  Configuration.resetGlobalState();
  // 关闭爬虫
  await crawler.teardown();

  res.status(200).json({ success: true, data: crawlerData });
}
