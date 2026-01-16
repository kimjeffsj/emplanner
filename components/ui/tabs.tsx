"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "bg-muted text-muted-foreground inline-flex min-h-13 w-fit items-center justify-center rounded-lg p-1 gap-1",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        // 어르신 친화적: 최소 높이 44px, 큰 패딩, 기본 폰트 크기
        "inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md px-5 py-2.5 text-base font-semibold whitespace-nowrap",
        // 상태 스타일: relative for indicator
        "relative border-2 border-transparent transition-all duration-200",
        "text-muted-foreground",
        // 활성 상태: 고대비 배경 + primary 틴트
        "data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-primary data-[state=active]:shadow-md data-[state=active]:font-bold",
        // 활성 상태 하단 인디케이터
        "after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:h-0.5 after:w-0 after:bg-primary after:transition-all after:duration-200",
        "data-[state=active]:after:w-3/4",
        // 호버 상태
        "hover:text-foreground hover:bg-background/70",
        // 포커스 상태: 고대비
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none",
        // 비활성 상태
        "disabled:pointer-events-none disabled:opacity-50",
        // 다크모드
        "dark:data-[state=active]:text-primary dark:data-[state=active]:border-primary dark:data-[state=active]:bg-primary/20 dark:text-muted-foreground",
        // SVG 아이콘
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
