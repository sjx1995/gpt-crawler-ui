# GPT-Crawler-UI

爬取网页内容，生成GPT机器人知识库 

## 运行项目

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 运行
pnpm build && pnpm start
```

## 使用方法

1. 输入爬取目标网址、网址过滤规则等信息
2. 等待爬虫爬取数据
3. 下载知识库文件`data.json`
4. 打开[GPT机器人](https://chat.openai.com/g/g-neAR0jAgY-crawlergpt)，导入知识库文件
5. 开始对话，机器人会根据知识库内容进行回复

## 💡

灵感来自于项目 [BuilderIO/gpt-crawler](https://github.com/BuilderIO/gpt-crawler)
