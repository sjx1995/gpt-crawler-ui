import { Configuration, PlaywrightCrawler } from "crawlee";
import type { Page } from "playwright";

import type { NextApiRequest, NextApiResponse } from "next";

export type ICrawlerParams = {
  target_url: string;
  match_urls: string[];
  max_pages: number;
  selector: string;
};

type ICrawlerData = {
  title: string;
  url: string;
  html: string;
};

// const TARGET_URL = "https://vuejs.org/";
// const MATCH_URL = "https://vuejs.org/**";
// const MAX_PAGES = 3;
const crawlerData: ICrawlerData[] = [];
// const SELECTOR = "body";

function getHTML(page: Page, selector: string) {
  return page.evaluate((selector) => {
    const el: HTMLElement | null = document.querySelector(selector);
    return el?.innerHTML || "";
  }, selector);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ICrawlerData[]>
) {
  const query = req.query as { [K in keyof ICrawlerParams]: string };
  const { target_url, selector } = query;
  let max_pages = Number(query.max_pages) > 50 ? 50 : Number(query.max_pages);
  let match_urls = query.match_urls.split(",");

  // 清空列表
  crawlerData.splice(0);

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
  await crawler.run([target_url]);

  // 重置全局状态
  Configuration.resetGlobalState();
  // 关闭爬虫
  await crawler.teardown();

  res.status(200).json(crawlerData);
}
