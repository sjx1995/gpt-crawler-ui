/*
 * @Description: index
 * @Author: Sunly
 * @Date: 2023-11-22 14:17:33
 */
import { useState } from "react";
import Footer from "./footer";
import Head from "next/head";
import {
  Input,
  InputNumber,
  Button,
  Space,
  Divider,
  message,
  Modal,
  Tooltip,
} from "antd";

import styles from "@/styles/Home.module.css";

import type {
  ICrawlerData,
  ICrawlerParams,
  ICrawlerRes,
} from "./api/crawler-data";

export default function Home() {
  const [messageApi, contextHolder] = message.useMessage();
  const [modal, modalContextHolder] = Modal.useModal();

  const [urlsData, setUrlsData] = useState<ICrawlerParams>({
    target_urls: [""],
    match_urls: [],
    max_pages: 5,
    selector: "",
  });

  const handleSetData = (
    key: keyof ICrawlerParams,
    value: string | number,
    idx?: number
  ) => {
    setUrlsData((prev) => {
      if ((key === "match_urls" || key === "target_urls") && idx != null) {
        const obj = { ...prev };
        obj[key][idx] = value as string;
        return obj;
      }
      return {
        ...prev,
        [key]: value,
      };
    });
  };

  const handleDelUrl = (key: "target_urls" | "match_urls", i: number) => {
    setUrlsData((obj) => {
      const urls = [...obj[key]];
      urls.splice(i, 1);
      return {
        ...obj,
        [key]: urls,
      };
    });
  };

  const handleAddUrl = (key: "target_urls" | "match_urls") => {
    setUrlsData((prev) => {
      const obj = { ...prev, [key]: [...prev[key], ""] };
      return obj;
    });
  };

  const [loading, setLoading] = useState(false);
  const handleClick = () => {
    const { target_urls, match_urls, max_pages, selector } = urlsData;

    setLoading(true);
    fetch(
      `/api/crawler-data` +
        `?target_urls=${target_urls}` +
        `&match_urls=${match_urls}` +
        `&max_pages=${max_pages}` +
        `&selector=${selector}`
    )
      .then((res) => {
        return res.json();
      })
      .then((res: ICrawlerData) => {
        if (res.success) {
          downloadJSON(res.data);
        } else {
          throw new Error(res.errMessage);
        }
      })
      .catch((err: Error) => {
        messageApi.error(err.message || "请求失败");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const downloadJSON = (data: ICrawlerRes[]) => {
    const blob = new Blob([JSON.stringify(data, null, 2)]);
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = `data.json`;
    link.click();
    modal.success(successModalConfig);
  };

  // 弹出框，导出后显示
  const successModalConfig = {
    title: "获取数据成功",
    content: (
      <>
        <p>
          1. 打开
          <a
            href="https://chat.openai.com/g/g-neAR0jAgY-crawlergpt"
            target="_blank"
          >
            GPT机器人
          </a>
        </p>
        <p>2. 将自动下载的数据作为文件上传，开始对话</p>
      </>
    ),
  };

  return (
    <>
      <Head>
        <title>Crawler GPT</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {contextHolder}
      {modalContextHolder}

      <main className={`${styles.main} `}>
        <Divider orientation="left">目标网址</Divider>

        {urlsData.target_urls.map((url, i) => (
          <Space.Compact
            block
            direction="horizontal"
            key={i}
            className={`${styles.item}`}
          >
            <Input
              value={url}
              placeholder="请输入目标网址"
              onChange={(e) => handleSetData("target_urls", e.target.value, i)}
            />
            <Button danger onClick={() => handleDelUrl("target_urls", i)}>
              删除
            </Button>
          </Space.Compact>
        ))}
        <Button
          onClick={() => handleAddUrl("target_urls")}
          block
          className={`${styles.item} `}
        >
          添加一条目标网址
        </Button>
        <Divider orientation="left">
          匹配网址规则
          <Tooltip
            title={
              <>
                <div>用来过滤需要爬取哪些网站，根据上面的目标网址设置：</div>
                <div>1. https://a.com/* 只访问一级目录</div>
                <div>2. https://a.com/*/x 匹配任何一级目录</div>
                <div>3. https://a.com/** 匹配所有a.com开头的网址</div>
              </>
            }
          >
            <span className={`${styles.ruleDesc}`}>什么是匹配规则？</span>
          </Tooltip>
        </Divider>
        {urlsData.match_urls.map((url, i) => (
          <Space.Compact
            block
            direction="horizontal"
            key={i}
            className={`${styles.item} `}
          >
            <Input
              value={url}
              placeholder="请输入匹配网址规则"
              onChange={(e) => handleSetData("match_urls", e.target.value, i)}
            />
            <Button danger onClick={() => handleDelUrl("match_urls", i)}>
              删除
            </Button>
          </Space.Compact>
        ))}
        <Button
          onClick={() => handleAddUrl("match_urls")}
          block
          className={`${styles.item} `}
        >
          添加一条匹配规则
        </Button>
        <Divider orientation="left">
          爬取页面最大数量
          <Tooltip
            title={
              <>
                <div>1. 数量越多，爬取速度越慢</div>
                <div>2. 太大的文本GPT无法分析</div>
              </>
            }
          >
            <span className={`${styles.ruleDesc}`}>数量不要太大</span>
          </Tooltip>
        </Divider>
        <InputNumber
          style={{ width: "100%" }}
          min={1}
          max={50}
          defaultValue={5}
          step={1}
          value={urlsData.max_pages}
          onChange={(value) => handleSetData("max_pages", value || 5)}
          className={`${styles.item} `}
          addonAfter={"1 ~ 50"}
        />
        <Divider orientation="left">内容CSS选择器</Divider>
        <Input
          value={urlsData.selector}
          placeholder="默认为空，表示读取整个页面"
          onChange={(e) => handleSetData("selector", e.target.value)}
          className={`${styles.item} `}
        />
        <Button
          onClick={handleClick}
          loading={loading}
          type="primary"
          className={`${styles.item} ${styles.submitBtn}`}
          block
        >
          开始请求数据
        </Button>
      </main>
      <Footer />
    </>
  );
}
