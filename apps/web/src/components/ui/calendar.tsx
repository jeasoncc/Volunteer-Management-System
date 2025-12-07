import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export interface CalendarProps {
  mode?: "single" | "range"
  selected?: Date | { from?: Date; to?: Date }
  onSelect?: (date: Date | { from?: Date; to?: Date } | undefined) => void
  defaultMonth?: Date
  className?: string
  disabled?: (date: Date) => boolean
  numberOfMonths?: number
  initialFocus?: boolean
}

interface CalendarState {
  currentMonth: Date
  hoveredDate: Date | null
}

/**
 * 自定义日历组件
 * 功能：
 * - 单日期选择
 * - 日期范围选择
 * - 月份切换
 * - 今日高亮
 * - 禁用日期
 * - 响应式设计
 */
export function Calendar({
  mode = "single",
  selected,
  onSelect,
  defaultMonth,
  className,
  disabled,
  numberOfMonths = 1,
  initialFocus,
}: CalendarProps) {
  const [state, setState] = React.useState<CalendarState>({
    currentMonth: defaultMonth || new Date(),
    hoveredDate: null,
  })

  // 获取月份的所有日期
  const getMonthDays = (date: Date): Date[] => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    const days: Date[] = []
    
    // 添加上个月的日期以填充第一周
    const firstDayOfWeek = firstDay.getDay()
    const daysToAdd = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1 // 周一为起始
    
    for (let i = daysToAdd; i > 0; i--) {
      const prevDate = new Date(year, month, 1 - i)
      days.push(prevDate)
    }
    
    // 添加当月的所有日期
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }
    
    // 添加下个月的日期以填充最后一周
    const remainingDays = 42 - days.length // 6行 x 7列
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i))
    }
    
    return days
  }

  // 检查日期是否相同
  const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    )
  }

  // 检查日期是否为今天
  const isToday = (date: Date): boolean => {
    return isSameDay(date, new Date())
  }

  // 检查日期是否在当前月份
  const isCurrentMonth = (date: Date): boolean => {
    return (
      date.getFullYear() === state.currentMonth.getFullYear() &&
      date.getMonth() === state.currentMonth.getMonth()
    )
  }

  // 检查日期是否被选中
  const isSelected = (date: Date): boolean => {
    if (!selected) return false
    
    if (mode === "single") {
      return isSameDay(date, selected as Date)
    } else {
      const range = selected as { from?: Date; to?: Date }
      if (range.from && isSameDay(date, range.from)) return true
      if (range.to && isSameDay(date, range.to)) return true
      return false
    }
  }

  // 检查日期是否在选中范围内
  const isInRange = (date: Date): boolean => {
    if (mode !== "range" || !selected) return false
    
    const range = selected as { from?: Date; to?: Date }
    if (!range.from || !range.to) return false
    
    return date > range.from && date < range.to
  }

  // 检查日期是否在悬停范围内（用于预览）
  const isInHoverRange = (date: Date): boolean => {
    if (mode !== "range" || !selected || !state.hoveredDate) return false
    
    const range = selected as { from?: Date; to?: Date }
    if (!range.from || range.to) return false
    
    const start = range.from < state.hoveredDate ? range.from : state.hoveredDate
    const end = range.from < state.hoveredDate ? state.hoveredDate : range.from
    
    return date > start && date < end
  }

  // 处理日期点击
  const handleDateClick = (date: Date) => {
    if (disabled && disabled(date)) return
    
    if (mode === "single") {
      onSelect?.(date)
    } else {
      const range = (selected as { from?: Date; to?: Date }) || {}
      
      if (!range.from || (range.from && range.to)) {
        // 开始新的范围选择
        onSelect?.({ from: date, to: undefined })
      } else {
        // 完成范围选择
        if (date < range.from) {
          onSelect?.({ from: date, to: range.from })
        } else {
          onSelect?.({ from: range.from, to: date })
        }
      }
    }
  }

  // 切换月份
  const changeMonth = (offset: number) => {
    setState(prev => ({
      ...prev,
      currentMonth: new Date(
        prev.currentMonth.getFullYear(),
        prev.currentMonth.getMonth() + offset,
        1
      ),
    }))
  }

  // 设置年份
  const setYear = (year: number) => {
    setState(prev => ({
      ...prev,
      currentMonth: new Date(year, prev.currentMonth.getMonth(), 1),
    }))
  }

  // 设置月份
  const setMonth = (month: number) => {
    setState(prev => ({
      ...prev,
      currentMonth: new Date(prev.currentMonth.getFullYear(), month, 1),
    }))
  }

  // 生成年份选项（从1900年到当前年份+10年）
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear()
    const years: number[] = []
    for (let year = 1900; year <= currentYear + 10; year++) {
      years.push(year)
    }
    return years.reverse() // 最新的年份在前面
  }

  // 生成月份选项
  const monthNames = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]

  // 渲染单个月份
  const renderMonth = (monthOffset: number = 0) => {
    const monthDate = new Date(
      state.currentMonth.getFullYear(),
      state.currentMonth.getMonth() + monthOffset,
      1
    )
    const days = getMonthDays(monthDate)
    const weekDays = ["一", "二", "三", "四", "五", "六", "日"]

    return (
      <div key={monthOffset} className="space-y-4">
        {/* 月份标题 - 改进版，支持快速选择年月 */}
        <div className="flex items-center justify-between gap-2">
          {monthOffset === 0 && (
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => changeMonth(-1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          
          <div className="flex items-center gap-2 flex-1 justify-center">
            {/* 年份选择器 */}
            <Select
              value={monthDate.getFullYear().toString()}
              onValueChange={(value) => setYear(parseInt(value))}
            >
              <SelectTrigger className="h-8 w-[100px] text-sm font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {generateYearOptions().map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}年
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 月份选择器 */}
            <Select
              value={monthDate.getMonth().toString()}
              onValueChange={(value) => setMonth(parseInt(value))}
            >
              <SelectTrigger className="h-8 w-[80px] text-sm font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {monthNames.map((name, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {monthOffset === numberOfMonths - 1 && (
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => changeMonth(1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* 星期标题 */}
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day) => (
            <div
              key={day}
              className="h-9 w-9 flex items-center justify-center text-xs text-muted-foreground font-medium"
            >
              {day}
            </div>
          ))}
        </div>

        {/* 日期网格 */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => {
            const isDisabled = disabled && disabled(date)
            const selected = isSelected(date)
            const inRange = isInRange(date)
            const inHoverRange = isInHoverRange(date)
            const today = isToday(date)
            const currentMonth = isCurrentMonth(date)

            return (
              <button
                key={index}
                type="button"
                disabled={isDisabled}
                onClick={() => handleDateClick(date)}
                onMouseEnter={() => setState(prev => ({ ...prev, hoveredDate: date }))}
                onMouseLeave={() => setState(prev => ({ ...prev, hoveredDate: null }))}
                className={cn(
                  "h-9 w-9 p-0 font-normal text-sm relative",
                  "rounded-md transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  !currentMonth && "text-muted-foreground opacity-50",
                  isDisabled && "text-muted-foreground opacity-50 cursor-not-allowed hover:bg-transparent",
                  selected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground font-semibold",
                  (inRange || inHoverRange) && !selected && "bg-accent/50",
                  today && !selected && "border-2 border-primary",
                )}
              >
                {date.getDate()}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("p-3", className)}>
      <div className={cn(
        "flex gap-4",
        numberOfMonths === 1 ? "justify-center" : "justify-start"
      )}>
        {Array.from({ length: numberOfMonths }, (_, i) => renderMonth(i))}
      </div>
    </div>
  )
}

Calendar.displayName = "Calendar"

