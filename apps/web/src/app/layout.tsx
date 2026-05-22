import type { Metadata } from "next";
import { ThemeProvider } from "@repo/ui";
import { Toaster } from "@repo/ui";
import { Shell } from "@/components/Shell";
import { WalletHydrator } from "@/components/WalletHydrator";
import "@repo/ui/globals.css";
import "./app.css";

export const metadata: Metadata = {
  title: "Bitrefill Wallet — 让你的钱包成为电商助手",
  description:
    "使用加密货币浏览和购买礼品卡、手机充值、eSIM — 安全、快速、去中心化。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <Toaster>
            <Shell>
              <WalletHydrator>{children}</WalletHydrator>
            </Shell>
          </Toaster>
        </ThemeProvider>
      </body>
    </html>
  );
}
