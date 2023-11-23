/*
 * @Description: Footer
 * @Author: Sunly
 * @Date: 2023-11-23 08:55:12
 */
import styles from "@/styles/Home.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      {`© Sunly 2023 · ${(
        <a href="https://github.com/sjx1995/gpt-crawler-ui" target="_blank">
          GITHUB
        </a>
      )} · ${(
        <a
          href="https://chat.openai.com/g/g-neAR0jAgY-crawlergpt"
          target="_blank"
        >
          GPT机器人
        </a>
      )}`}
    </footer>
  );
}
