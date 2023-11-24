/*
 * @Description: 爬取网页内容
 * @Author: Sunly
 * @Date: 2023-11-22 14:17:33
 */
import {
  Configuration,
  PlaywrightCrawler,
  purgeDefaultStorages,
} from "crawlee";
import type { Page } from "playwright";

import type { NextApiRequest, NextApiResponse } from "next";

export type ICrawlerParams = {
  target_urls: string[];
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

function filterValidURLs(urlStr: string): string[] {
  const urls = urlStr.split(",");
  return urls
    .map((url) =>
      url.startsWith("https://") || url.startsWith("http://")
        ? url
        : `https://${url}`
    )
    .filter((url) => {
      url = url.trim();
      if (!url) return false;
      try {
        new URL(url);
        return true;
      } catch (error) {
        return false;
      }
    });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ICrawlerData>
) {
  const query = req.query as { [K in keyof ICrawlerParams]: string };
  let target_urls = filterValidURLs(query.target_urls);
  if (!target_urls.length) {
    res
      .status(400)
      .json({ success: false, errMessage: "请传入有效的目标网址" });
  }
  let selector = query.selector.trim() || "body";
  let max_pages =
    Number(query.max_pages) < target_urls.length
      ? target_urls.length
      : Number(query.max_pages) > 50
      ? 50
      : Number(query.max_pages);
  let match_urls = filterValidURLs(query.match_urls);

  const crawlerData: ICrawlerRes[] = [];

  // 创建爬虫
  const crawler = new PlaywrightCrawler({
    async requestHandler({ request, page, enqueueLinks, log }) {
      const title = await page.title();
      log.info(`Page title: ${title}`);

      const html = await getHTML(page, selector);

      crawlerData.push({ title, url: request.loadedUrl || "", html });

      await enqueueLinks({ globs: match_urls });
    },

    maxRequestsPerCrawl: max_pages,
    maxConcurrency: 1,
    maxRequestRetries: 2,
  });

  // 开始爬取
  try {
    await crawler.run(target_urls);
  } catch (error) {
    res.status(500).json({
      success: false,
      errMessage: (error as Error).message || "请求失败",
    });
  }

  // 重置全局状态
  Configuration.resetGlobalState();
  await purgeDefaultStorages();
  // 关闭爬虫
  if (crawler.running) {
    await crawler.teardown();
  }

  res.status(200).json({ success: true, data: crawlerData });
}
